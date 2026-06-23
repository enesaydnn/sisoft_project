const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        await parser.destroy();
        
        return result.text || result;
        
    } catch (error) {
        throw new Error(`PDF okuma hatası: ${error.message}`);
    }
};

module.exports = {
    extractTextFromPDF
};