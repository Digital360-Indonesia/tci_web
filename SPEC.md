# TCI Web — Technical Specification

> **Project**: Convert terminalcargoindonesia.com dari WordPress ke Astro  
> **Repo**: tci_web  
> **Date**: 2026-06-03  
> **Author**: System Analyst

---

## 1. Executive Summary

Website terminalcargoindonesia.com saat ini berjalan di WordPress dengan tema "Logtra". Project ini mengconvert seluruh website ke Astro static site, mempertahankan SEMUA konten (~654 halaman), dengan design refresh yang improve UX & performance. WP REST API aktif dan akan digunakan untuk scraping semua konten secara programmatic.

---

## 2. Business Context

### Perusahaan
- **Nama**: PT Terminal Cargo Indonesia (TCI)
- **Berdiri**: 1 Agustus 2014
- **Bisnis**: Forwarding & ekspedisi — pengiriman barang via Udara, Darat, Laut
- **Basis**: Surabaya (Terminal Cargo T2 Bandara Juanda, Sidoarjo)

### Tujuan Convert
1. **Performance**: WordPress lambat. Astro SSG = near-instant load.
2. **Maintainability**: Tidak perlu lagi manage WordPress updates/plugins/themes.
3. **SEO**: Static pages load faster = better ranking. Pertahankan semua URL.
4. **Security**: Static site = tidak ada attack surface (no PHP, no database).
5. **Hosting cost**: Bisa deploy di CDN/static hosting, jauh lebih murah.

### KPI Sukses
- Lighthouse Performance > 90
- Semua URL dari sitemap lama tetap accessible (preserve URL structure)
- Semua gambar ter-download ke lokal (tidak hotlink dari WP)
- Build time < 5 menit untuk ~654 halaman

---

## 3. Content Inventory

### Sumber Data
- **WP REST API**: `https://terminalcargoindonesia.com/wp-json/wp/v2/` (aktif, public)
- **Sitemap**: `https://terminalcargoindonesia.com/sitemap.xml`

### Breakdown Halaman

| Tipe | Jumlah | Sumber | Handling |
|------|--------|--------|----------|
| **Static Pages** | 3 | Manual | Hardcoded di Astro pages |
| **Service Pages** | 3 | Manual | Hardcoded di Astro pages |
| **Blog Artikel** | ~135 | WP REST API (categories: Edukasi, Promosi, Tips & Trik) | Markdown files via scrape script |
| **SEO Landing Pages** | ~512 | WP REST API (category: Uncategorized) | Programmatic — 1 template + JSON data |
| **Total** | **~653** | | |

### Static Pages (Hardcode)
1. `/` — Beranda (Homepage)
2. `/tentang/` — Tentang Kami
3. `/kontak/` — Kontak

### Service Pages (Hardcode)
1. `/service/kargo-udara/`
2. `/service/kargo-laut/`
3. `/service/kargo-darat/`

### Blog Categories
| Category | ID | Count | Slug |
|----------|----|-------|------|
| Edukasi | 533 | 121 | `edukasi` |
| Promosi | 534 | 9 | `promosi` |
| Tips & Trik | 535 | 5 | `tips-trik` |
| Uncategorized (SEO) | 1 | 512 | `uncategorized` |

### Blog Pagination
- Total blog posts (non-SEO): ~135
- Pagination: `/berita/page/2/` sampai `/berita/page/65/` (10 per page di WP)
- Di Astro: 9 per page (3×3 grid), berarti ~15 halaman pagination

---

## 4. User Stories (Prioritized — MoSCoW)

### Must Have

```
Sebagai pengunjung, saya ingin melihat homepage dengan informasi layanan TCI,
sehingga saya memahami apa yang ditawarkan perusahaan.

Sebagai pengunjung, saya ingin membaca artikel blog,
sehingga saya mendapat informasi edukasi tentang logistik.

Sebagai pengunjung, saya ingin melihat daftar artikel di halaman berita dengan pagination,
sehingga saya bisa browse semua konten.

Sebagai pengunjung, saya ingin melihat halaman detail layanan (Udara, Laut, Darat),
sehingga saya memahami layanan yang tersedia.

Sebagai pengunjung, saya ingin melihat halaman Tentang Kami,
sehingga saya mengenal perusahaan lebih dalam.

Sebagai pengunjung, saya ingin melihat halaman Kontak,
sehingga saya bisa menghubungi TCI.

Sebagai pengunjung, saya ingin mengakses SEO landing pages "Jasa Ekspedisi Termurah Surabaya ke [Kota]",
sehingga saya menemukan TCI saat mencari jasa pengiriman ke kota saya.

Sebagai pengunjung, saya ingin ada tombol WhatsApp CTA yang mudah diakses,
sehingga saya bisa langsung konsultasi.
```

### Should Have

```
Sebagai pengunjung, saya ingin filter blog berdasarkan kategori,
sehingga saya bisa fokus ke topik yang saya butuh.

Sebagai pengunjung, saya ingin halaman responsif dan cepat di mobile,
sehingga saya bisa akses dari HP dengan nyaman.

Sebagai pengunjung, saya ingin navigasi yang jelas dengan link ke Cek Resi dan Cek Harga (app),
sehingga saya bisa langsung pakai fitur tanpa bingung.
```

### Could Have

```
Sebagai pengunjung, saya ingin search functionality di blog,
sehingga saya bisa cari topik spesifik.

Sebagai pengunjung, saya ingin related articles di bawah setiap artikel,
sehingga saya bisa baca konten terkait.
```

### Won't Have (Sengaja di-exclude)
- Login/Dashboard (already separate app at app.terminalcargoindonesia.com)
- Cek Resi/Cek Harga (already separate app)
- Comment system (tidak perlu, SEO blog tidak punya interaksi signifikan)
- Multi-language (semua Bahasa Indonesia)
- CMS/Admin panel (static site, content update via Git)
- Form kontak backend processing (cukup link ke WhatsApp)

---

## 5. Data Model

### 5.1 Content Collections

Astro Content Collections akan menyimpan data blog:

```
Collection: blog
  - id: number (WP post ID)
  - slug: string
  - title: string (rendered, HTML stripped)
  - content: string (rendered HTML)
  - excerpt: string (rendered HTML)
  - date: string (ISO 8601)
  - modified: string (ISO 8601)
  - featuredImage: string (local path)
  - category: string (edukasi | promosi | tips-trik)
  - tags: string[]
  - author: string
  - metaDescription: string (from Yoast)
  - ogImage: string (from Yoast)
```

### 5.2 SEO Landing Pages Data

```
File: src/data/seo-cities.json
Type: Array<{
  slug: string         // "jasa-ekspedisi-termurah-surabaya-ke-bandar-lampung"
  cityName: string     // "Bandar Lampung"
  province: string     // "Lampung"
  content: string      // full rendered HTML from WP
  metaDescription: string
  featuredImage: string
}>
```

### 5.3 Static Data

```
File: src/data/company.ts
  - companyName: "PT Terminal Cargo Indonesia"
  - tagline: "Jasa Cargo Udara Surabaya Termurah"
  - description: string
  - foundedYear: 2014
  - phone: "(031) 5828 5034"
  - whatsapp: "0812 5259 5159"
  - whatsappLink: "https://wa.me/6281252595159"
  - email1: "info@terminalcargoindonesia.com"
  - email2: "cs@terminalcargoindonesia.com"
  - address: "Terminal Cargo T2 Bandara Juanda, Sidoarjo"
  - operationalHours: { days: "Senin - Sabtu", time: "09:00 - 23:59 WIB" }
  - socialLinks: { facebook, instagram }
  - appLinks: { cekResi, cekHargaPtp, cekHargaDtd, cekHargaDarat, cekHargaDaratLaut, cekHargaLaut, login }
  - legalDocs: { notaris, nomor, kehakiman, noTdp, noNpwp, noSiup, noSiujpt }
  - vision: string[]
  - mission: string[]
  - culture: { title, description }[]
  - statistics: { udara, laut, darat } (counter animation)
  - testimonials: [
      { name: "Adi Prasetyo", quote: "PT Terminal Cargo Indonesia telah memberikan layanan pengiriman kargo yang sangat handal dan efisien...", avatar: "/images/testimonials/80x80-1.png" },
      { name: "Rizky Firmansyah", quote: "Saya sangat puas dengan pengalaman menggunakan jasa pengiriman kargo PT Terminal Cargo Indonesia...", avatar: "/images/testimonials/80x80-2.png" },
      { name: "Ahmad Faisal", quote: "Saya telah menggunakan layanan PT Terminal Cargo Indonesia untuk mengirim kargo melalui udara...", avatar: "/images/testimonials/80x80-3.png" },
      { name: "Dika Ramadhan", quote: "PT Terminal Cargo Indonesia adalah mitra yang andal dalam pengiriman kargo...", avatar: "/images/testimonials/80x80-4.png" },
      { name: "Rizaldi Gunawan", quote: "Saya mengalami sedikit masalah dengan pengiriman kargo saya melalui PT Terminal Cargo Indonesia...", avatar: "/images/testimonials/80x80-5.png" }
    ]
```

---

## 6. Feature Specifications

### 6.1 Homepage (`/`)

**Aktor**: Public  
**Flow**:
1. Hero section: Tagline + CTA (Hubungi Kami via WA)
2. About preview: Ringkasan + gambar + link ke Tentang
3. Statistik: Counter animasi (160k++ pengiriman, 99% puas, 10+ tahun)
4. Layanan: 3 card (Kargo Laut, Kargo Udara, Kargo Darat) → link ke detail
5. Testimoni: Carousel/slider 5 review
6. CTA section: Hubungi via WhatsApp
7. Footer: Company info, link bantuan, jam operasional, Google Maps embed

**Design Notes**:
- Hero: Full-width background image + gradient overlay + text
- Mobile: Stack layout, hamburger menu
- Performance: Lazy load images below fold

### 6.2 Blog Listing (`/berita/`)

**Aktor**: Public  
**Flow**:
1. Tampilkan 9 artikel per halaman (3×3 grid desktop, 1 kolom mobile)
2. Setiap card: thumbnail, title, excerpt, date, category badge, "Baca Selengkapnya" link
3. Pagination: nomor halaman di bawah (1, 2, 3, ... 15, Next)
4. Sidebar: Search input, category filter, recent posts
5. Filter by category via query param: `/berita/?category=edukasi`

**Validasi**:
- Jika halaman > max page, redirect ke halaman terakhir
- Jika category tidak valid, tampilkan semua

**Edge Cases**:
- Artkel tanpa featured image → gunakan fallback image
- Excerpt terlalu panjang → truncate 150 karakter

### 6.3 Blog Detail (`/[slug]/`)

**Aktor**: Public  
**Flow**:
1. Breadcrumb: Beranda > [Category] > [Title]
2. Featured image (full width)
3. Meta info: date, author, category badge
4. Article body (rendered HTML from WP)
5. Tags list (clickable, filter ke berita)
6. CTA: Hubungi via WhatsApp
7. Sidebar: Search, category, recent posts

**Content Processing**:
- WP REST API returns `content.rendered` (HTML)
- Konversi: ganti domain gambar WP → local path
- Strip `data-start`, `data-end`, `data-section-id` attributes (SEO editor artifacts)
- Convert internal links yang masih pakai WP domain

### 6.4 Service Pages (`/service/[slug]/`)

**Aktor**: Public  
**Flow**:
1. Hero banner (service-specific image)
2. Service title + description
3. CTA: Hubungi kami

**3 Service Pages**:
| Slug | Title | Image |
|------|-------|-------|
| `kargo-udara` | Kargo Udara | `tci_layanan_cargo_udara.png` |
| `kargo-laut` | Kargo Laut | `tci_layanan_cargo_laut.png` |
| `kargo-darat` | Kargo Darat | `tci_tentang_cargo_darat.png` |

**Note**: Konten "Freight Overview" dan "Our strengths" di WP masih placeholder. Di versi baru, tulis ulang konten yang proper (gunakan konten dari homepage card descriptions sebagai base).

### 6.5 Tentang Kami (`/tentang/`)

**Aktor**: Public  
**Flow**:
1. Hero image (`tci_tentang_kami.png`)
2. Company profile text
3. Legal documents section
4. Visi & Misi
5. Budaya Perusahaan (4 values)

### 6.6 Kontak (`/kontak/`)

**Aktor**: Public  
**Flow**:
1. Contact info cards: Lokasi, Telepon, Email
2. Google Maps embed (iframe)
3. CTA: Hubungi via WhatsApp

### 6.7 SEO Landing Pages (`/jasa-ekspedisi-termurah-surabaya-ke-[city]/`)

**Aktor**: Public (from search engines)  
**Flow**:
1. Generate via `getStaticPaths()` from `seo-cities.json`
2. Setiap halaman: Template identik, hanya beda nama kota
3. Konten: Rendered HTML dari WP (sudah ada konten spesifik per kota)
4. SEO: Title & meta description mengandung nama kota

**Implementation**:
```
src/pages/[...seoSlug].astro
  → getStaticPaths() reads seo-cities.json
  → Render template with city-specific data
```

---

## 7. Technical Decisions

### TD-01: Astro SSG (Static Site Generation)
**Konteks**: WordPress dynamic vs Astro static  
**Pilihan**: WordPress rebuild vs Headless WP vs Astro SSG vs Next.js SSG  
**Keputusan**: Astro SSG  
**Alasan**: 
- 655 halaman, hampir semua konten statis — tidak butuh server-side rendering
- Astro output pure HTML, performa optimal
- Content collections built-in untuk blog management
- Zero JavaScript by default (island architecture)

### TD-02: Content Strategy — Scrape + Localize
**Konteks**: Blog content dari WP REST API  
**Pilihan**: Runtime fetch dari WP API vs Pre-scrape ke markdown files vs Pre-scrape ke JSON  
**Keputusan**: Pre-scrape via Node.js script → simpan sebagai Astro Content Collections (markdown frontmatter + HTML body)  
**Alasan**:
- Build time: Tidak perlu fetch API setiap build
- Reliability: Tidak bergantung pada WP server uptime
- Flexibility: Content bisa di-edit sebelum build

### TD-03: SEO Landing Pages — Programmatic
**Konteks**: 512 halaman identik  
**Pilihan**: 512 markdown files vs 1 template + JSON  
**Keputusan**: 1 Astro page template + `seo-cities.json` data file  
**Alasan**:
- Maintainability: Edit 1 template, update 512 halaman
- Build efficiency: Astro optimized untuk programmatic pages
- Data driven: JSON bisa di-regenerate dari WP API kapan saja

### TD-04: Image Strategy — Download All Local
**Konteks**: Gambar ada di `terminalcargoindonesia.com/wp-content/uploads/`  
**Pilihan**: Hotlink vs Download lokal vs CDN  
**Keputusan**: Download semua gambar ke `public/images/`  
**Alasan**:
- Independence: Setelah convert, WP server bisa dimatikan
- Performance: Astro akan optimize images via `astro:assets`
- SEO: Kontrol penuh atas image optimization (format, size, lazy load)

### TD-05: Design — Refresh (Bukan Replika)
**Konteks**: Desain WordPress "Logtra" theme  
**Pilihan**: Pixel-perfect copy vs Design refresh  
**Keputusan**: Design refresh — pertahankan brand identity, improve layout & UX  
**Alasan**:
- WordPress theme punya banyak visual noise (animasi berlebihan, layout kurang clean)
- Astro + Tailwind memungkinkan design yang lebih modern
- Brand identity (logo, warna, konten) tetap sama

### TD-06: No CMS — Git-based Content
**Konteks**: Bagaimana update konten ke depan?  
**Pilihan**: Headless CMS vs Git-based  
**Keputusan**: Git-based (file-based content)  
**Alasan**:
- Tidak ada admin panel yang perlu di-maintain
- Content update = edit markdown → git push → rebuild
- Untuk blog yang jarang update (1-2 artikel/bulan), ini lebih dari cukup
- Jika ke depan butuh CMS, bisa ditambahkan tanpa mengubah architecture

### TD-07: Deployment — Same Domain, Static Hosting
**Konteks**: Domain terminalcargoindonesia.com  
**Pilihan**: VPS + Nginx vs Cloudflare Pages vs Netlify  
**Keputusan**: Deploy static files ke server yang ada, Nginx serve static HTML  
**Alasan**:
- Client sudah punya server
- Tidak perlu biaya tambahan
- Nginx serve static HTML sangat efisien

---

## 8. Project Structure

```
tci_web/
├── public/
│   ├── images/                    # All downloaded images from WP
│   │   ├── uploads/               # WP content images (blog, etc.)
│   │   │   ├── 2023/
│   │   │   ├── 2024/
│   │   │   └── 2025/
│   │   ├── brand/                 # Logo, favicon
│   │   │   ├── tci-logo-white.png
│   │   │   ├── tci-logo_.png
│   │   │   └── favicon.ico
│   │   └── fallback-article.jpg
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Topbar.astro
│   │   │   └── Layout.astro
│   │   ├── home/
│   │   │   ├── Hero.astro
│   │   │   ├── AboutPreview.astro
│   │   │   ├── Statistics.astro
│   │   │   ├── Services.astro
│   │   │   ├── Testimonials.astro
│   │   │   └── CTASection.astro
│   │   ├── blog/
│   │   │   ├── ArticleCard.astro
│   │   │   ├── Pagination.astro
│   │   │   ├── Sidebar.astro
│   │   │   └── CategoryFilter.astro
│   │   ├── service/
│   │   │   └── ServiceDetail.astro
│   │   └── shared/
│   │       ├── WhatsAppButton.astro
│   │       └── Breadcrumb.astro
│   ├── content/
│   │   ├── config.ts               # Content collection schema
│   │   └── blog/                   # ~135 markdown files
│   │       ├── cara-menghitung-tarif-pengiriman-barang.md
│   │       ├── perbedaan-kargo-udara-laut-dan-darat.md
│   │       └── ...
│   ├── data/
│   │   ├── company.ts              # Static company info
│   │   ├── seo-cities.json         # 512 SEO landing page data
│   │   └── testimonials.ts         # Testimonial data
│   ├── layouts/
│   │   ├── BaseLayout.astro        # HTML head, meta, scripts
│   │   ├── PageLayout.astro        # Navbar + Footer wrapper
│   │   └── BlogPostLayout.astro    # Blog detail layout
│   ├── pages/
│   │   ├── index.astro             # Homepage
│   │   ├── tentang.astro
│   │   ├── kontak.astro
│   │   ├── berita/
│   │   │   ├── index.astro         # Blog listing (page 1)
│   │   │   └── page/
│   │   │       └── [page].astro    # Blog listing pagination
│   │   ├── service/
│   │   │   ├── kargo-udara.astro
│   │   │   ├── kargo-laut.astro
│   │   │   └── kargo-darat.astro
│   │   ├── [slug].astro            # Blog detail (dynamic)
│   │   └── [...seoSlug].astro      # SEO landing pages (catch-all)
│   ├── styles/
│   │   └── global.css              # Tailwind imports + custom
│   └── utils/
│       ├── wp-scraper.ts           # Script: scrape WP REST API → content files
│       ├── image-downloader.ts     # Script: download all WP images
│       └── content-helpers.ts      # Helpers: strip HTML, truncate, date format
├── scripts/
│   ├── scrape-posts.ts             # Scrape blog posts from WP API
│   ├── scrape-seo-pages.ts         # Scrape SEO landing pages from WP API
│   └── download-images.ts          # Download all referenced images
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── SPEC.md                         # This file
```

---

## 9. Scrape Strategy

### Phase 1: Scrape Content (Before Development)

**Script 1: `scripts/scrape-posts.ts`**
```
1. GET /wp-json/wp/v2/posts?categories=533,534,535&per_page=100&page=1..N
2. For each post:
   a. Extract: id, slug, title.rendered, content.rendered, excerpt.rendered
   b. Extract: date, modified, featured_media, categories, tags, author
   c. Extract Yoast: meta description, OG image
   d. Download featured image to public/images/uploads/
   e. Replace all WP image URLs in content with local paths
   f. Strip data-* attributes from HTML
   g. Save as markdown file with frontmatter
3. Save mapping: category ID → slug, tag ID → name
```

**Script 2: `scripts/scrape-seo-pages.ts`**
```
1. GET /wp-json/wp/v2/posts?categories=1&per_page=100&page=1..6
2. For each post:
   a. Extract: slug, title.rendered, content.rendered
   b. Extract city name from slug (regex: "jasa-ekspedisi-termurah-surabaya-ke-(.*)")
   c. Download featured image
   d. Replace image URLs with local paths
3. Save all as seo-cities.json
```

**Script 3: `scripts/download-images.ts`**
```
1. Scan all content files for image URLs
2. Download each unique image to public/images/uploads/YYYY/
3. Update content files with local paths
```

**Also download these static images**:
```
public/images/brand/
  - tci-logo-white.png
  - tci-logo_.png
  - tci_wahyu.png (founder photo)
  - favicon

public/images/
  - tci_tentang_kami.png
  - tci_tentang_cargo_darat.png
  - tci_layanan_cargo_udara.png
  - tci_layanan_cargo_laut.png
  - tci-service-shape.png
  - tci-train-amico.png
  - service-2-1.jpg
  - cargo-ship-4-1.png
  - Icon-plane-2-1.png
  - Icon-plane-3-1.png
  - tci_icon_cargo_darat_putih.png
  - about-2.png
  ```
  
  **Testimonial avatars (download dari shtheme.com/demo theme):**
  ```
  public/images/testimonials/
    - 80x80-1.png    # Adi Prasetyo
    - 80x80-2.png    # Rizky Firmansyah
    - 80x80-3.png    # Ahmad Faisal
    - 80x80-4.png    # Dika Ramadhan
    - 80x80-5.png    # Rizaldi Gunawan
  ```

### Image URLs to Download (Unique Hosts)
- `https://terminalcargoindonesia.com/wp-content/uploads/` → `public/images/uploads/`
- `https://shtheme.com/demosd/logtra/wp-content/uploads/` → `public/images/theme/` (demo theme images)

---

## 10. SEO Considerations

### URL Preservation (Critical!)
Semua URL dari WordPress HARUS tetap sama:

| WordPress URL | Astro File |
|---------------|-----------|
| `/` | `src/pages/index.astro` |
| `/tentang/` | `src/pages/tentang.astro` |
| `/kontak/` | `src/pages/kontak.astro` |
| `/berita/` | `src/pages/berita/index.astro` |
| `/berita/page/2/` | `src/pages/berita/page/[page].astro` |
| `/service/kargo-udara/` | `src/pages/service/kargo-udara.astro` |
| `/cara-menghitung-tarif-pengiriman-barang/` | `src/pages/[slug].astro` |
| `/jasa-ekspedisi-termurah-surabaya-ke-bandar-lampung/` | `src/pages/[...seoSlug].astro` |

### Meta Tags
Setiap halaman harus punya:
- `<title>` — dari Yoast data atau generated
- `<meta name="description">` — dari Yoast
- `canonical URL`
- Open Graph tags (og:title, og:description, og:image, og:url)
- Structured data (Article schema for blog posts)

### Sitemap
- Generate `sitemap.xml` via `@astrojs/sitemap`
- Submit ulang ke Google Search Console setelah deploy

### robots.txt
```
User-agent: *
Allow: /
Sitemap: https://terminalcargoindonesia.com/sitemap-index.xml
```

### Google Analytics & Tag Manager

**Google Tag Manager**: `GTM-M7J6H8GZ`  
**Google Analytics 4**: `G-ZTE3YF6148`

Implementasi di `BaseLayout.astro`:

```astro
---
// src/layouts/BaseLayout.astro
---

<!-- Google Tag Manager (head) -->
<script is:inline>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M7J6H8GZ');</script>
<!-- End Google Tag Manager (head) -->

<html>
<head>
  <!-- GA4 via GTM (already handled by GTM snippet above) -->
</head>
<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M7J6H8GZ"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
</body>
</html>
```

**Note**: GTM sudah include GA4. Jadi cukup GTM snippet saja — GA4 tag `G-ZTE3YF6148` dikonfigurasi di dalam GTM container, tidak perlu gtag.js terpisah.

---

## 11. Design Direction

### Brand Colors (Resmi TCI)
- **Primary (Blue)**: `#021B43` — Navy dark blue (navbar, headings, footer, trust elements)
- **Accent (Orange)**: `#FF5001` — Bright orange (CTA buttons, highlights, badges, links hover)
- **Background**: `#FFFFFF` — White
- **Surface**: `#F8F9FA` — Light gray (alternate sections, cards)
- **Text**: `#1A1A1A` — Near-black (body text)
- **Muted**: `#6B7280` — Gray (secondary text, captions)
- **White text**: `#FFFFFF` — Used on primary/accent backgrounds

### Tailwind Config (Brand Colors)
```js
// tailwind.config.mjs
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#021B43',
        50: '#E8EAF0',
        100: '#C5C9D9',
        // ... shades
      },
      accent: {
        DEFAULT: '#FF5001',
        50: '#FFF0E8',
        // ... shades
      }
    }
  }
}
```
- **Headings**: Inter atau Plus Jakarta Sans (modern, clean)
- **Body**: Inter atau system font stack

### Design Principles
1. **Clean & Professional**: Cargo/logistics company — trust & reliability
2. **Mobile-first**: Mayoritas traffic dari mobile
3. **CTA-focused**: Setiap section punya jalan ke WhatsApp
4. **Fast**: No heavy animations, lazy load images
5. **Accessible**: Proper contrast, semantic HTML, alt text

### Layout
- **Navbar**: Sticky, logo left, menu center/right, CTA button
- **Footer**: 4 column (Company info, Link Bantuan, Jam Operasional, Lokasi)
- **Blog**: Card grid, sidebar on desktop, stacked on mobile
- **Mobile**: Hamburger menu, floating WhatsApp button

---

## 12. External Links (No Change)

These link to the existing app and must be preserved:
- **Cek Resi**: `https://app.terminalcargoindonesia.com/cek-resi/`
- **Cek Harga Udara PTP**: `https://app.terminalcargoindonesia.com/cek-harga/`
- **Cek Harga Udara DTD**: `https://app.terminalcargoindonesia.com/cek-harga-ptd/`
- **Cek Harga Darat**: `https://app.terminalcargoindonesia.com/public/cek-harga-darat`
- **Cek Harga Darat & Laut**: `https://app.terminalcargoindonesia.com/public/cek-harga-darat-laut`
- **Cek Harga Laut**: `https://app.terminalcargoindonesia.com/public/cek-harga-laut`
- **Login**: `https://app.terminalcargoindonesia.com/dasbor`
- **WhatsApp**: `https://wa.me/6281252595159`
- **Google Maps**: `https://maps.app.goo.gl/h14NMQ8Dj9M4mdJF6`

---

## 13. Implementation Phases

### Phase 1: Foundation + Content Scrape (1 hari)
1. Init Astro project (Astro + Tailwind)
2. Run scrape scripts → download semua konten & gambar
3. Setup content collections
4. Setup base layout (Navbar, Footer, SEO head)

### Phase 2: Static Pages (1 hari)
1. Homepage
2. Tentang Kami
3. Kontak
4. Service pages (3)
5. Tim & Proyek pages (2)

### Phase 3: Blog (1 hari)
1. Blog listing with pagination
2. Blog detail page
3. Category filter
4. Sidebar

### Phase 4: SEO Landing Pages (0.5 hari)
1. Template + JSON data integration
2. getStaticPaths()
3. SEO meta tags

### Phase 5: Polish + Deploy (0.5 hari)
1. Responsive testing
2. Performance optimization (image optimization, lazy load)
3. Generate sitemap
4. Deploy to server
5. DNS cutover

**Total Estimasi: 4 hari**

---

## 14. Open Questions

| # | Question | Status | Notes |
|---|----------|--------|-------|
| 1 | Brand colors — ada HEX code resmi dari TCI? | **RESOLVED** | Primary Blue: `#021B43`, Accent Orange: `#FF5001`. |
| 2 | Halaman Tim & Proyek — kontennya masih relevan? | **RESOLVED** | Tidak ada. Drop dari scope. |
| 3 | Service detail pages — konten "Freight Overview" masih lorem ipsum. Tulis ulang atau skip section? | **RESOLVED** | Konten akan diperbarui belakangan. Sementara pakai konten yang ada dari WP (termasuk placeholder sections). |
| 4 | Google Analytics — ada tracking ID yang perlu dipasang? | **RESOLVED** | GA4: `G-ZTE3YF6148`, GTM: `GTM-M7J6H8GZ`. Both must be in BaseLayout `<head>`. |
| 5 | Testimoni — nama & foto orang asli atau placeholder? | **RESOLVED** | Pakai testimoni yang sekarang (5 testimonial dari WP). Foto meskipun dari demo theme ikut di-download. |

---

## 15. Dependencies

```json
{
  "dependencies": {
    "astro": "^6.x",
    "@astrojs/tailwind": "^6.x",
    "@astrojs/sitemap": "^3.x",
    "tailwindcss": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "sharp": "^0.33.x"
  }
}
```

### Scrape Script Dependencies
```json
{
  "devDependencies": {
    "node-fetch": "^3.x",
    "cheerio": "^1.x",
    "fs-extra": "^11.x"
  }
}
```
