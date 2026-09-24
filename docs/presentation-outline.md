# Clean Core Copilot — sunum taslağı

Codex'in hazırlık taslağından uyarlandı. İçerik taslağı; slayt ya da video
değil. Sayısal her değer gerçek ölçümden gelecek, şimdilik hepsi "ölçülecek".

## 1. Sorun

**Legacy ABAP modernization starts with uncertainty.**
Eski bir Z raporunu taşımak sözdizimi değiştirmek değil: iş davranışı, sistem
bağımlılıkları ve hedef sürümün izin verdiği API'ler birlikte anlaşılmalı.
Görsel: `zfi_vendor_aging` parçası + "Hangi bağımlılık? Hangi hedef? Hangi kanıt?"

## 2. Çözüm

**From legacy report to a reviewable migration plan.**
Akış: ABAP dosyası + hedef bağlamı → Bob custom mode → kural ID'li, satır
kanıtlı bulgular (JSON) → gerekçeli öneri → doğrulama durumu → insan incelemesi.
Vurgu: bilinmeyeni açıkça gösteren çıktı.

## 3. Demo (canlı değil, kayıtlı Bob oturumu + demo sayfası)

1. Bob'da Clean Core Architect mode'u, `zfi_vendor_aging` üzerinde denetim.
2. Demo sayfası: bulgu → kaynak satırı; `needs_verification` etiketi.
3. Dört örneğin yan yana özeti (Ready/Refactor/Rebuild *ipucu*, kesin hüküm değil).
4. Modernize edilmiş kod + yaşlandırma kovalarını sabitleyen ABAP Unit testi.

## 4. IBM Bob'un katkısı

`bob_sessions/` kayıtlarına göre doldurulacak: custom mode, kurallar, Plan →
Code akışı, coin tüketimi. Kullanılmayan özelliği kullanılmış gibi gösterme.

## 5. Ölçüm ve sınırlar

Tablo: dondurulmuş elle hazırlanmış baseline'a karşı doğru / yanlış / kısmen /
kaçan / sınıflandırılamayan. Sınırlar: sentetik örnekler, sorunlar bilerek
yerleştirildi, hedef sistemde çalıştırılmadıysa açıkça söylenir. SAP
sertifikası değildir.

## 6. Devam

Hedef sürüme ait release metadata (SAP `abap-atc-cr-cv-s4hc`) entegrasyonu,
gerçek ATC sonuçlarını içe alma, daha çok örnek.

## Üç dakikalık akış

- 0:00–0:25 somut inceleme problemi
- 0:25–0:45 örnek rapor ve hedef bağlamı
- 0:45–1:45 Bob mode'u → bulgular → demo sayfası
- 1:45–2:15 modernize kod + test
- 2:15–2:45 ölçüm tablosu ve sınırlar
- 2:45–3:00 fayda ve sonraki adım

## Teslim kontrolü

Proje adı; kısa/uzun açıklama; etiketler; kapak; video; slaytlar; demo URL;
public repo; `bob_sessions/` (temizlenmiş). Son teslimden önce platformdaki
zorunlu alanları tekrar kontrol et.
