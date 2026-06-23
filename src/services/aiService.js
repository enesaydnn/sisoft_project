const evaluateCVWithOllama = async (cvText, fileName) => {
    const nonCvKeywords = [
        'mülakat proje ödevi', 
        'proje özeti', 
        'beklenen işlevler', 
        'mock veri üretimi', 
        'teknik beklentiler', 
        'değerlendirme kriterleri',
        'json çıktı formatı',
        'katmanlı mimari',
        'prompt kararlılığı'
    ];
    
    const lowerText = cvText.toLowerCase();

    if (!cvText || cvText.trim().length < 20 || nonCvKeywords.some(word => lowerText.includes(word))) {
        return { isCV: false };
    }

    const prompt = `SEN BİR İK UZMANI VE TEKNİK DEĞERLENDİRİCİSİN.

İLK VE EN ÖNEMLİ KURAL (CV KONTROLÜ):
Aşağıdaki metni dikkatlice oku. Metnin bir özgeçmiş (CV/Resume) olup olmadığını kontrol et. Eğer metin bir ödev talimatı, proje açıklaması veya ders notu ise kesinlikle 'isCV': false döndür.

Eğer metin GERÇEKTEN BİR CV İSE, "Yazılım Geliştirici" pozisyonu için aşağıdaki kriterlere göre değerlendir.

DEĞERLENDİRME KRİTERLERİ (SADECE CV İSE):
1. universityAndDepartment: Bilgisayar/Yazılım Mühendisliği, YBS vb. yüksek puan.
2. foreignLanguages: İngilizce seviyesine göre puanla.
3. projects: Gerçek yazılım projeleri, GitHub çalışmaları.
4. internships: Sektördeki stajlar ve iş deneyimleri.
5. aiCompetency: Yapay zeka, makine öğrenmesi, veri bilimi ilgisi.

PUANLAMA KURALLARI:
- Her kriter 1 ile 100 arasında olmalıdır.
- Sadece gerçek CV içeriğine göre puan ver.

DİL KURALI (HAYATİ ÖNEM TAŞIR):
- TÜM CEVAP %100 TÜRKÇE OLMALIDIR.
- shortEvaluation en fazla 2 cümle olmalı ve 3. şahıs dili ("kullanmıştır", "sahiptir") ile yazılmalıdır.

ÇIKTI KURALI:
SADECE VE SADECE JSON DÖNDÜR. Markdown, kod bloğu veya açıklama KULLANMA.

{
  "isCV": true,
  "candidateName": "[Adayın Adı ve Soyadı]",
  "detailedScores": {
    "universityAndDepartment": 0,
    "foreignLanguages": 0,
    "projects": 0,
    "internships": 0,
    "aiCompetency": 0
  },
  "shortEvaluation": "[Adayın teknolojilerini anlatan 2 cümlelik profesyonel Türkçe özet]"
}

METİN:
${cvText}`;

    try {
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3', 
                prompt: prompt,
                stream: false,
                format: 'json',
                options: {
                    temperature: 0.1,
                    seed: 42,
                    top_p: 0.1,
                    top_k: 10
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API Hatası: ${response.status}`);
        }

        const data = await response.json();
        const cleanJsonStr = data.response.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
        const parsedResult = JSON.parse(cleanJsonStr);
        
        const resultString = JSON.stringify(parsedResult).toLowerCase();
        if (parsedResult.isCV === false || nonCvKeywords.some(word => resultString.includes(word))) {
            return { isCV: false };
        }
        
        const scores = parsedResult.detailedScores || {};
        
        const uScore = isNaN(Number(scores.universityAndDepartment)) ? 20 : Number(scores.universityAndDepartment);
        const fScore = isNaN(Number(scores.foreignLanguages)) ? 20 : Number(scores.foreignLanguages);
        const pScore = isNaN(Number(scores.projects)) ? 20 : Number(scores.projects);
        const iScore = isNaN(Number(scores.internships)) ? 20 : Number(scores.internships);
        const aScore = isNaN(Number(scores.aiCompetency)) ? 20 : Number(scores.aiCompetency);
        
        const totalScore = uScore + fScore + pScore + iScore + aScore;

        parsedResult.detailedScores = {
            universityAndDepartment: uScore,
            foreignLanguages: fScore,
            projects: pScore,
            internships: iScore,
            aiCompetency: aScore
        };
        
        parsedResult.averageScore = parseFloat((totalScore / 5).toFixed(1));
        parsedResult.pdfFileName = fileName;
        parsedResult.isCV = true;

        const cleanFileName = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ').trim();

        if (!parsedResult.candidateName || parsedResult.candidateName.trim() === '' || parsedResult.candidateName.includes('[Adayın')) {
            parsedResult.candidateName = cleanFileName;
        }

        if (!parsedResult.shortEvaluation || parsedResult.shortEvaluation.trim() === '' || parsedResult.shortEvaluation.includes('[Adayın')) {
            parsedResult.shortEvaluation = `${parsedResult.candidateName} isimli adayın teknik profili ve yazılım yetkinlikleri başarıyla incelenmiştir.`;
        }

        return parsedResult;

    } catch (error) {
        console.error("Yapay zeka analiz hatası:", error);
        return { isCV: false };
    }
};

module.exports = {
    evaluateCVWithOllama
};