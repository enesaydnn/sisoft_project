class CandidateModel {
    constructor(candidateName, pdfFileName, detailedScores, averageScore, shortEvaluation) {
        this.candidateName = candidateName;
        this.pdfFileName = pdfFileName;
        this.detailedScores = detailedScores;
        this.averageScore = averageScore;
        this.shortEvaluation = shortEvaluation;
    }
}

module.exports = CandidateModel;