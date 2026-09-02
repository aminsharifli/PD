# Rice Roleplay - LSPD Dosya Oluşturucu

Los Santos Polis Departmanı (LSPD) suç dosyaları ve raporları için **tek sayfalık** şablon oluşturucu — Rice Roleplay FiveM sunucusu için. Memur bilgileri doldurur, canlı önizlemeyi görür ve nihai belgeyi Discord'da paylaşmak için **yüksek kaliteli PNG** olarak indirir. Arayüz ve belgedeki tüm metinler Türkçedir.

## Teknoloji

- **React 18** + **Vite**
- **Tailwind CSS 3** (koyu tema)
- **lucide-react** — arayüz ikonları
- **html2canvas** — belge konteynerini PNG'ye çevirir (Türkçe karakterler İ/ı/Ş/ş/Ğ/ğ/Ü/ü/Ö/ö/Ç/ç dahil doğru render edilir)

## Kurulum & Çalıştırma

```bash
npm install
npm run dev
```

Sonra tarayıcıda Vite'ın gösterdiği adresi aç (genelde `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## Logo / marka

Amblem sabittir: Rice Roleplay "R" + palmiye motifinin polis rozeti biçimine uyarlanmış saf SVG hâli — `src/components/RiceBadge.jsx`. Üst çubukta, belge başlığında ve soluk arka plan filigranında aynı bileşen kullanılır. Şeklini/renklerini düzenlemek için doğrudan bu dosyadaki SVG yollarını değiştir. Sunucu/departman adları `src/constants.js` → `ORG` nesnesinden yönetilir.

## Nasıl çalışır

| Panel | Rol |
| --- | --- |
| **Sol panel** (`src/components/FormPanel.jsx`) | Tüm giriş alanları: belge türü & durum, Dosya No (otomatik/elle), tarih-saat, memur adı & rozet no, şüpheliler, bölüm başlığı, olay özeti, suçlamalar, kanıt görselleri + açıklamalar. |
| **Sağ panel** (`src/components/DocumentPreview.jsx`) | Resmî, koyu renkli kolluk belgesi. Yazdıkça anında güncellenir. |

**PNG çıktısı** (`src/lib/exportImage.js`): `html2canvas` YALNIZCA `DocumentPreview` konteynerini yakalar (`previewRef`). Sol paneldeki butonlar ve inputlar görüntüye girmez. `scale: 3` ile ~2460px genişliğinde keskin çıktı alınır.

## Dosya yapısı

```
src/
├─ App.jsx                     # Tüm state + iki panelli düzen
├─ constants.js                # ORG (Rice Roleplay/LSPD), belge türleri, durumlar & renkler
├─ lib/
│  ├─ helpers.js               # Dosya No üretimi, tarih, dosya → dataURL
│  └─ exportImage.js           # html2canvas PNG çıktısı
└─ components/
   ├─ FormPanel.jsx            # Sol panel (form + sürükle-bırak kanıt yükleyici)
   ├─ DocumentPreview.jsx      # Sağ panel (yakalanan belge)
   ├─ RiceBadge.jsx            # Sabit SVG amblem (Rice "R" + palmiye, polis rozeti stili)
   └─ ui/Inputs.jsx            # Tekrar kullanılabilir input/select/textarea
```

## Notlar

- Kanıt görselleri `FileReader` ile base64 data-URL olarak saklanır → `html2canvas`'ta CORS sorunu olmaz.
- Tailwind v3 kullanılır (v4'ün `oklch` renkleri `html2canvas` ile uyumsuzdur).
- Oluşturulan belgeler kurgusaldır ve yalnızca roleplay içindir.
