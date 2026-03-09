

## İletişim Sayfası Planı

### Yapılacaklar

1. **`src/pages/Contact.tsx` oluştur** — Tam iletişim sayfası:
   - **İletişim Formu**: Ad, e-posta, telefon (opsiyonel), konu seçimi (dropdown), mesaj alanları. Zod ile client-side validasyon. `react-hook-form` kullanılacak.
   - **İletişim Bilgileri**: Adres (Laval, QC), telefon, e-posta, çalışma saatleri — ikonlarla birlikte.
   - **Google Maps embed**: Laval, QC konumunu gösteren iframe harita.
   - Tüm metinler bilingual (EN/FR) — `useLanguage()` ile.

2. **`src/contexts/LanguageContext.tsx` güncelle** — İletişim sayfası için yeni çeviri anahtarları ekle (form alanları, başarı/hata mesajları, başlıklar).

3. **`src/App.tsx` güncelle** — `/contact` route ekle.

4. **`src/components/NavBar.tsx` güncelle** — Contact linkini `/#contact` yerine `/contact` olarak değiştir.

5. **Veritabanı (opsiyonel)**: Form gönderimlerini `contact_messages` tablosuna kaydetmek için migration oluştur. RLS ile herkes INSERT yapabilir ama sadece admin okuyabilir.

### Teknik Detaylar
- Form: `react-hook-form` + `zod` + `@hookform/resolvers` (zaten yüklü)
- Harita: Google Maps iframe embed (API key gerektirmez)
- Supabase'e form verisi kaydetme: `contact_messages` tablosu (name, email, phone, subject, message, created_at)
- Başarılı gönderim sonrası toast bildirimi

