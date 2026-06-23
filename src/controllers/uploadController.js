const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractTextFromPDF } = require('../services/pdfService');
const { evaluateCVWithOllama } = require('../services/aiService');

const CandidateModel = require('../models/CandidateModel');
const CandidateDTO = require('../dtos/CandidateDTO');

const uploadDir = path.join(process.cwd(), 'uploads');
const runsDir = path.join(uploadDir, 'WinCv');
const deletedDir = path.join(uploadDir, 'DeletedCv');

[uploadDir, runsDir, deletedDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const getNextRunNumber = () => {
    if (!fs.existsSync(runsDir)) return 1;
    const dirs = fs.readdirSync(runsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => parseInt(dirent.name))
        .filter(num => !isNaN(num));
    return dirs.length > 0 ? Math.max(...dirs) + 1 : 1;
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Sadece PDF dosyaları yüklenebilir!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
}).array('cvFiles', 10);

const handleUpload = (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ status: "error", message: err.message });
        }

        if (!req.files || req.files.length < 2) {
            return res.status(400).json({ status: "error", message: "Sıralama yapılabilmesi için en az 2 adet CV yüklemelisiniz." });
        }

        try {
            const evaluatedCandidates = [];
            const runNumber = getNextRunNumber().toString(); 

            for (const file of req.files) {
                const filePath = path.join(uploadDir, file.filename);
                
                const textContent = await extractTextFromPDF(filePath);
                const aiResult = await evaluateCVWithOllama(textContent, file.originalname);
                
                if (aiResult.isCV === false) {
                    req.files.forEach(f => {
                        const tempPath = path.join(uploadDir, f.filename);
                        if(fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                    });

                    return res.status(400).json({ 
                        status: "error", 
                        message: `Hata: '${file.originalname}' bir CV değil! Lütfen silin.` 
                    });
                }
                
                const candidateObj = new CandidateModel(
                    aiResult.candidateName,
                    file.filename,
                    aiResult.detailedScores,
                    aiResult.averageScore,
                    aiResult.shortEvaluation
                );
                
                candidateObj.originalPdfName = file.originalname; 
                evaluatedCandidates.push(candidateObj);
            }

            evaluatedCandidates.sort((a, b) => {
                if (b.averageScore !== a.averageScore) {
                    return b.averageScore - a.averageScore;
                }
                const bProjects = b.detailedScores.projects || 0;
                const aProjects = a.detailedScores.projects || 0;
                if (bProjects !== aProjects) {
                    return bProjects - aProjects;
                }
                const bAi = b.detailedScores.aiCompetency || 0;
                const aAi = a.detailedScores.aiCompetency || 0;
                return bAi - aAi;
            });

            const top5Candidates = evaluatedCandidates.slice(0, 5);

            const currentWinDir = path.join(runsDir, runNumber);
            const currentDeletedDir = path.join(deletedDir, runNumber);
            
            fs.mkdirSync(currentWinDir, { recursive: true });
            fs.mkdirSync(currentDeletedDir, { recursive: true });

            const top5FileNames = top5Candidates.map(c => c.pdfFileName);

            for (const file of req.files) {
                const oldPath = path.join(uploadDir, file.filename);
                
                if (top5FileNames.includes(file.filename)) {
                    const newPath = path.join(currentWinDir, file.filename);
                    if(fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
                } else {
                    const newPath = path.join(currentDeletedDir, file.filename);
                    if(fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
                }
            }

            const formattedTopCandidates = top5Candidates.map((candidate, index) => {
                candidate.pdfFileName = candidate.originalPdfName; 
                return CandidateDTO.toResponse(candidate, index + 1);
            });

            res.status(200).json({
                status: "success",
                processedCVCount: req.files.length,
                topCandidates: formattedTopCandidates
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "error", message: "Yapay zeka analiz aşamasında hata oluştu." });
        }
    });
};

module.exports = {
    handleUpload
};