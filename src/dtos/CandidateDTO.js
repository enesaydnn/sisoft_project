class CandidateDTO {
    static toResponse(candidate, rankIndex) {
        return {
            rank: rankIndex,
            candidateName: candidate.candidateName,
            pdfFileName: candidate.pdfFileName,
            detailedScores: candidate.detailedScores,
            averageScore: candidate.averageScore,
            shortEvaluation: candidate.shortEvaluation
        };
    }
}

module.exports = CandidateDTO;