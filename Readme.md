Projemin ismi **TalentLens**, Google Lens’ten ilham alarak bu ismi koydum.

Herkese merhaba ben Enes,
Bu proje benim için oldukça öğretici bir süreç oldu. Bu imkânı sağlayan sisoft ekibine teşekkür ederim.
Projemi JavaScript tabanlı bir mimari ile geliştirdim. UI/UX tasarımında kullanıcı deneyimini sade ve anlaşılır tutmaya çalıştım. 

NOT : Projem lokalde kusursuz çalışıyor ve sıralama algoritmam doğru işliyor. Ancak testlerimde, farklı bilgisayarlardaki donanım farklılıklarının (CPU/GPU mimarisi) yerel LLM çıktılarını ve dolayısıyla aday skorlarını değiştirebildiğini tespit ettim. İnsanların hakkının yenmemesi ve adaletsiz eleme yapılmaması için, bu tarz yapay zeka sistemlerinin yerel makinelerde değil, donanımı sabitlenmiş merkezi bir sunucuda (Cloud) çalışması etik ve teknik bir zorunluluktur.

Kurulum aşamalarıne geçicek olursak bu projeyi javascript mimarisiyle yaptığım için node.js kurarak başlayacağız

## 1. Node.js Kurulumu

Projeyi çalıştırmak için öncelikle JavaScript çalışma ortamı olan Node.js'in bilgisayarınızda yüklü olması gerekir.

### 🪟 Windows İçin:
1. https://nodejs.org/ adresine gidin.
2. Ana sayfada yer alan "LTS" (Long Term Support) sürümünü indirin.
3. İndirdiğiniz dosyayı çalıştırın ve ayarları değiştirmeden "Next" diyerek kurulumu tamamlayın.
4. `Windows + R` tuşlarına basın, `cmd` yazın ve Enter'a basın. Açılan ekrana `node -v` yazın; bir sürüm numarası görüyorsanız kurulum başarılıdır.

### 🍎 Mac (macOS) İçin:
1. https://nodejs.org/ adresine gidin.
2. Ana sayfada yer alan "LTS" (Long Term Support) sürümünü (.pkg uzantılı) indirin.
3. Dosyayı açın ve kurulum adımlarını takip edin.
4. `Cmd + Space` tuşlarına basıp "Terminal" yazarak uygulamayı açın. `node -v` yazarak kurulumu doğrulayın.

---

## 2. Ollama Kurulumu ve Llama 3 Modelinin İndirilmesi

Sistem, yapay zeka analizlerini kendi bilgisayarınızda gerçekleştirdiği için Ollama motoruna ihtiyaç duyar.

### 🪟 Windows İçin:
1. https://ollama.com/download adresine gidin ve Windows için indirip kurun.
2. Kurulum bitince sağ alt köşedeki görev çubuğunda Ollama simgesinin olduğunu kontrol edin.
3. Yeni bir Komut İstemi (CMD) açın ve şu komutu yazarak yapay zeka modelini indirin:
   ollama pull llama3
4. İndirme %100 olana kadar bekleyin.

### 🍎 Mac (macOS) İçin:
1. https://ollama.com/download adresine gidin ve macOS için indirin.
2. İndirilen dosyayı "Uygulamalar" klasörüne sürükleyin ve çalıştırın.
3. Terminali açın ve şu komutu yazarak yapay zeka modelini indirin:
   ollama pull llama3

---

## 3. Sistemin Çalıştırılması

ÖNEMLİ : Ollama her zaman açık olmalı. 

Tüm kurulumlar tamamlandıktan sonra, uygulamayı başlatmak için şu adımları izleyin:

1. **Yapay Zekayı Hazırlayın:** Ollama uygulamasının arka planda açık olduğundan emin olun. Eğer bir bağlantı sorunu yaşarsanız, terminale `ollama run llama3` yazarak modelin etkileşime hazır olmasını sağlayabilirsiniz.

2. **Paketleri Yükleyin:** Proje klasörünün içerisinde bir terminal/CMD açın ve şu komutu çalıştırın:
   npm install
   *(Bu komut, işletim sisteminize uygun kütüphaneleri otomatik olarak indirir.)*

3. **Uygulamayı Başlatın:** Aynı terminal ekranında şu komutu yazarak projeyi çalıştırın:
   node app.js

Uygulama başarıyla başlatıldığında, terminal ekranında sistemin hazır olduğuna dair bir bilgi mesajı göreceksiniz. Artık TalentLens kullanıma hazırdır!

## 4. Sistem Mimarisi ve Güvenlik Yönetimi

1. Akıllı Dosya Sınıflandırma: Analiz edilen özgeçmişler; seçilenler `WinCv` ve elenenler `DeletedCv` dizinlerinde, kendi içlerinde versiyonlanarak(Çalıştırılma sırasına göre 1, 2, 3 olarak) klasörlenir. 
2. Mükerrer Kayıt Kontrolü: Sisteme yüklenen dosyalar kontrol edilerek, aynı dosyanın iki kez işlenmesi önlenir.
3. Boyut ve Kapasite Yönetimi: 50MB üzerindeki dosyalar işleme alınmaz. Sistemin zaman aşımına uğramaması adına eş zamanlı analiz kapasitesi maksimum 10 aday ile sınırlandırılmıştır.
4. Benzersiz İsimlendirme: PDF dosyaları sistem tarafından otomatik olarak benzersiz bir formatta isimlendirilir, dosya isim çakışmaları engellenir.
5. Doğrulama ve Filtreleme: Sistem, özgeçmiş içeriği taşımayan (fatura, makale vb.) PDF dosyalarını tespit eder ve sadece teknik yetkinlik içeren dosyaları işleme alır.


Bu proje, **enesaydn.com** tarafından geliştirilmiştir. 

*Geliştirici: **Enes Aydın***
