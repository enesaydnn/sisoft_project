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
Aşağıdaki metni dikkatlice oku. Metnin bir özgeçmiş (CV/Resume) olup olmadığını kontrol et.

Eğer metin GERÇEKTEN BİR CV İSE, "Yazılım Geliştirici" pozisyonu için aşağıdaki kriterlere göre değerlendir.

DEĞERLENDİRME KRİTERLERİ (SADECE CV İSE):

1. universityAndDepartment
- Bilgisayar Mühendisliği, Yazılım Mühendisliği, Yönetim Bilişim Sistemleri vb. bölümler yüksek puan alır.
- Yazılım ile ilgisiz bölümler daha düşük puan alır.

2. foreignLanguages
- Türkçe DIŞINDAKİ tüm yabancı diller (İngilizce, Almanca, İspanyolca vb.) dikkate alınmalıdır.
- Yabancı dil sayısı ve seviyelerine (temel, orta, ileri, profesyonel) göre değerlendirme yapıp puanla.
- Ne kadar çok yabancı dil varsa ve seviyeleri ne kadar yüksekse o kadar yüksek puan ver.

3. projects
- Gerçek yazılım projeleri, GitHub çalışmaları, ekip projeleri ve teknik geliştirmeler yüksek puan alır.
- Proje yoksa düşük puan ver.

4. internships
- Yazılım sektöründeki stajlar ve iş deneyimleri yüksek puan alır.
- Deneyim yoksa düşük puan ver.

5. aiCompetency
- Yapay zeka, makine öğrenmesi, LLM, veri bilimi veya AI araçları kullanımı yüksek puan alır.
- Hiç yoksa düşük puan ver.

PUANLAMA KURALLARI:

- Her kriter 1 ile 100 arasında olmalıdır.
- Sadece gerçek CV içeriğine göre puan ver.
- Bilgi yoksa 20-40 arası puan ver.
- Çok güçlü ise 80-100 arası puan ver.
- Tahmin yürütme, CV'de yazan bilgilere dayan.

DİL KURALI (HAYATİ ÖNEM TAŞIR):

- SENİN ANA DİLİN TÜRKÇEDİR. Karşına İngilizce CV gelse bile TÜM ANALİZİ SADECE TÜRKÇE YAPACAKSIN.
- İngilizce yanıt vermen veya İngilizce kelime kullanman KESİNLİKLE YASAKTIR! Tüm alanlar %100 Türkçe olmalıdır.
- shortEvaluation en fazla 2 cümle olmalıdır.
- shortEvaluation DÜZGÜN, ANLAMLI VE KURALLI TÜRKÇE CÜMLELERDEN OLUŞMALIDIR. "Aday geliştirmiştir, sahiptir" gibi kelimeleri anlamsızca yan yana dizme! Özne ve yüklem uyumuna dikkat et.
- DOĞRU KULLANIM MANTIĞI: "Aday, [CV'de Geçen Teknoloji] teknolojilerinde proje geliştirme tecrübesine sahiptir."
- KESİNLİKLE birinci tekil şahıs ("geliştiriyorum", "yaptım") KULLANMA. Hep 3. şahıs dili kullan ("kullanmıştır", "sahiptir").
- shortEvaluation içinde adayın kullandığı teknolojiler ve yaptığı çalışmalar özetlenmelidir.

ÇIKTI KURALI:

SADECE JSON DÖNDÜR.
Açıklama yazma.
Markdown kullanma.
Kod bloğu kullanma.

JSON ŞEMASI (HAYATİ KURAL: METİN CV OLSUN VEYA OLMASIN SADECE VE SADECE BU ŞABLONU KULLAN! EĞER CV DEĞİLSE SADECE "isCV": false YAP, EĞER CV İSE "isCV": true YAP VE TÜM BİLGİLERİ DOLDUR):

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
  "shortEvaluation": "[Adayın teknolojilerini ve projelerini anlatan 2 cümlelik profesyonel Türkçe özet]"
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