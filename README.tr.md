<!-- i18n-source: README.md  i18n-hash: 0d1ee2588d9c2cc3  -->

[English](README.md) · [简体中文](README.zh-CN.md) · **Türkçe**

# Apple Ads CLI

**Apple Search Ads kampanyalarınızı yapay zekâ ajanınızdan yönetin — ve hangi anahtar kelimelerin gerçekten kâr getirdiğini görün, sadece hangilerinin dönüşüm getirdiğini değil.**

[Adapty CLI](https://github.com/adaptyteam/adapty-cli) üzerine kurulu Apple Search Ads becerileri, oyun kitapları ve dikey rehberler. Claude Code, Cowork, Codex, Gemini CLI ve Copilot CLI ile çalışır.

> CLI'ın kendisi `npm i -g adapty` ile kurulur. Bu depo ise onun üzerindeki ajan katmanıdır: ne yapılacağı, ne zaman ve neden.

---

## Neden var

Her Apple Ads aracı bir anahtar kelimenin kurulum başına maliyetini söyleyebilir. Hiçbiri o kurulumun altı hafta sonra ne değerde olduğunu söyleyemez.

Apple'ın API'si harcamayı, dokunuşları ve kurulumları bilir. `samsung tv remote` aramasından gelen kullanıcının haftalık aboneliği dört kez yenilediğini, `free remote app` aramasından gelenin ise ikinci gün iptal ettiğini bilmez. Reklam bütçeleri tam da bu boşlukta erir — ve bu boşluğu kapatmak abonelik verisi gerektirir; Adapty'nin sahip olduğu şey de budur.

Bu yüzden bu, bir ajanın şu soruyu yanıtlayabildiği tek Apple Search Ads kurulumudur:

```
30. günde kohort gelirine göre — kurulum sayısına göre değil — hangi anahtar kelimeler kâr ediyor?
```

---

## Kurulum

```bash
npm i -g adapty
adapty auth login
adapty asa connect
```

Ardından ajan katmanını ekleyin:

```bash
claude plugin marketplace add adaptyteam/apple-ads-cli
claude plugin install apple-ads@adapty
```

<details>
<summary>Diğer ajanlar</summary>

```bash
# Codex, Gemini CLI, Copilot CLI, Cursor, Zed ve diğerleri
npx skills add adaptyteam/apple-ads-cli --all

# Yalnızca tek bir beceri
npx skills add adaptyteam/apple-ads-cli --skill apple-ads-strategy
```

Bu yolla kurulan beceriler kendiliğinden güncellenmez — sonrasında `npx skills update` çalıştırın.
Üçüncü taraf pazar yerlerinden gelen eklentiler de otomatik güncellenmez — `claude plugin update apple-ads@adapty` çalıştırın.

</details>

<details>
<summary>Claude Cowork</summary>

Cowork komutları yalnızca izin listesindeki alan adlarına erişebilen bir korumalı alanda çalıştırır. Kurulumdan önce **hem** `adapty.io` **hem de** `*.adapty.io` ekleyin — çoğu izin listesi uygulamasında joker karakter, ana alan adını kapsamaz.

Ayarlar → Capabilities → kod çalıştırmayı etkinleştirin → ağ çıkışına izin verin → her iki alan adını ekleyin. Ayarlar görev başlarken uygulanır; bu nedenle konuşmanın ortasında yapılan değişiklikler mevcut görevi etkilemez.

</details>

---

## İçindekiler

| | |
|---|---|
| **`apple-ads`** | Uygulayıcı. Performansı okur, teklifleri ve bütçeleri değiştirir, anahtar kelime ve negatif ekler, arama terimlerini hasat eder, kampanyaları başlatır ve durdurur — hepsi CLI üzerinden ve para harcayan her işlemden önce onay alarak. |
| **`apple-ads-audit`** | Salt okunur denetçi. Hesap sağlığını, yayın durumunu, canlı yapıyı, trafik sahipliğini, yinelenen tam eşleşmeli anahtar kelimeleri ve bir performans özetini — harcama, gösterim, dokunma, ortalama CPT, yükleme, CPI, deneme başına maliyet ve ödeme başına maliyet — kontrol eder. Hiçbir şeyi değiştirmez. |
| **`apple-ads-strategy`** | Planlayıcı. **Hesap, CLI veya abonelik gerektirmez.** "Bir TV kumandası uygulamam var, nereden başlamalıyım" sorusunu eksiksiz bir hesap yapısına, anahtar kelime taksonomisine, başlangıç bütçesine ve negatif listesine dönüştürür. |
| **Oyun kitapları** | Haftalık kontrol · hesap sağlığı · yapı denetimi · kohort ROAS · anahtar kelime teklif incelemesi · Market Intelligence fırsatları · arama terimi hasadı · negatif anahtar kelime madenciliği · CPP yönlendirme · bütçe yeniden dağıtımı · kampanya başlatma · kontrolsüz harcama · otomasyon kuralları. |
| **Dikey rehberler** | Kategoriye özel oyun kitapları — talep profili, anahtar kelime taksonomisi, hesap yapısı, başlangıç ekonomisi ve o kategoriye özgü başarısızlık biçimleri. |

Tüm oyun kitapları doğrudan burada, GitHub üzerinde okunabilir. Kullanmak için ne bir kurulum ne de bir Adapty hesabı gerekir.

---

## Deneyin

```
> Geçen ay 30 günlük kohort ROAS'ına göre hangi reklam gruplarım zarar etti?
> Bu canlı hesabı denetle ve ilgilenmem gerekenleri göster; hiçbir şeyi değiştirme.
> Bu üç rakip App Store kimliğinde görünen, ancak hesabımda olmayan ABD arama terimleri hangileri?
> Geçen haftanın arama terimlerini tam eşleşmeli anahtar kelimelere ve negatiflere dönüştür, önce planı göster.
> Haftalık abonelikli araç uygulamamın CPI'ı hedefin 3 katı. Kaçak nerede?
> Evrensel bir TV kumandası uygulaması çıkarıyorum. Bana bir kampanya yapısı kur.
```

Sonuncusu için strateji becerisi dışında hiçbir şey kurmanız gerekmez.

---

## Güvenlik

Apple Ads'in **test ortamı yoktur.** Her çağrı canlıya gider ve gerçek para harcar.

- Okumalar ücretsizdir. Her yazma işlemi önce önizlenir ve açık onay ister.
- Yazma işlemleri bir idempotency anahtarı taşır; sonucu belirsiz bir yeniden deneme ikinci bir kampanya oluşturmaz.
- İstek bütçeleri uygulanır; bir ajan hız limitinizi saatler süren bir bekleme cezasına dönüştüremez.
- Silme yoktur. Kampanya silme, tasarım gereği yalnızca panelden yapılır.

---

## Gereksinimler ve sınırlar

- Node 18+, Adapty CLI 0.4.0 veya üzeri.
- Bir Apple Ads **Advanced** hesabı.
- Etkin bir Adapty Ads Manager aboneliği — **aylık 5.000 $ gelirin altında ücretsiz**, sonrasında reklam harcamasının %3,5'i. Abonelik olmadan `asa` komutları `402` döndürür.
- Planlama becerisi ve bu depodaki tüm oyun kitapları yukarıdakilerin hiçbirini gerektirmez.

---

## Yol haritası

- **Apple Ads Platform API v1.** Apple, Campaign Management API'yi **26 Ocak 2027**'de kullanımdan kaldıracak. Platform API v1 aynı OAuth akışını korur ancak `orgId` yerine `adAccountId` kullanır ve Apple Maps reklamlarını ekler. Geçiş durumu açık şekilde takip edilir.
- **Barındırılan MCP** — Node kurulumu ve alan adı izin listesi olmadan doğrudan Claude'dan bağlanın.
- **Daha fazla dikey** — rehber kütüphanesi kategori kategori büyür.

---

## Bağlantılar

- [Adapty CLI](https://github.com/adaptyteam/adapty-cli) · [CLI dokümantasyonu](https://adapty.io/docs/developer-cli-quickstart)
- [Ads Manager beceri dokümantasyonu](https://adapty.io/docs/developer-cli-ads-manager-skill)
- [Adapty SDK entegrasyon becerisi](https://github.com/adaptyteam/adapty-sdk-integration-skill)

Issue ve pull request'ler memnuniyetle karşılanır — özellikle yeni dikey rehberler. [Şablona](skills/apple-ads-strategy/references/verticals/_TEMPLATE.md) bakın.
