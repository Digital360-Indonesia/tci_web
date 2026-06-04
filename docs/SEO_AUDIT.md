# SEO Audit — Terminal Cargo Indonesia

**Tanggal audit**: 2026-06-04
**Total halaman**: 674
**Status**: ✅ Complete

---

## Scorecard

| Kategori | Jumlah Halaman | Status |
|----------|:--------------:|--------|
| Homepage | 1 | 🟢 |
| Service pages | 3 | 🟢 |
| Tentang | 1 | 🟢 |
| Kontak | 1 | 🟢 |
| Berita (listing + pagination) | 16 | 🟢 |
| Blog articles | 136 | 🟢 |
| SEO city landing pages | 512 | 🟢 |
| Cek Resi | 1 | 🟢 |
| Cek Harga (5 pages) | 5 | 🟢 |

---

## Top 10 Critical Issues

### 1. 🔴 512 SEO city pages — meta description kosong
**Severity**: CRITICAL
**File**: `src/data/seo-cities.json`

Semua 512 entry punya `metaDescription: ""`. Fallback ke title (~60 chars), jauh dari ideal 150-160 chars.

**Fix**: Generate meta description template per city, misal:
`"Jasa ekspedisi termurah dari Surabaya ke {Kota}. Pengiriman cargo udara, darat & laut. Door to Door. PT Terminal Cargo Indonesia."` (~145 chars)

**Status**: ✅ Fixed — dynamic meta description template: "Jasa ekspedisi termurah dari Surabaya ke {Kota}. Pengiriman cargo udara, darat & laut. Door to Door. PT Terminal Cargo Indonesia." (~147 chars)

---

### 2. 🔴 6 pages — duplicate meta description
**Severity**: HIGH

Halaman berikut pakai `SITE.description` (223 chars, sama dengan homepage):

| Halaman | File |
|---------|------|
| Kontak | `src/pages/kontak.astro` |
| Cek Harga Udara PTP | `src/pages/cek-harga.astro` |
| Cek Harga Udara DTD | `src/pages/cek-harga-ptd.astro` |
| Cek Harga Darat | `src/pages/cek-harga-darat.astro` |
| Cek Harga Laut | `src/pages/cek-harga-laut.astro` |
| Cek Harga Darat & Laut | `src/pages/cek-harga-darat-laut.astro` |

**Fix**: Tulis unique description per halaman (150-160 chars).

**Status**: ✅ Fixed — 6 halaman dapat unique description

---

### 3. 🔴 No JSON-LD structured data
**Severity**: HIGH
**File**: `src/layouts/BaseLayout.astro`, `src/pages/[slug].astro`

Tidak ada schema.org markup di seluruh website. Kehilangan rich snippet opportunity.

**Yang perlu ditambahkan**:
- `Organization` / `LocalBusiness` — di BaseLayout (semua halaman)
- `BreadcrumbList` — di semua halaman
- `Article` — di blog articles
- `FAQ` — di service pages yang punya FAQ

**Status**: ✅ Fixed — JSON-LD structured data added to all pages:
- `LocalBusiness` — BaseLayout (semua 674 halaman)
- `Service` + `FAQPage` + `BreadcrumbList` — 3 service pages (kargo udara/laut/darat)
- `Article` + `BreadcrumbList` — 136 blog articles (headline, datePublished, dateModified, author, publisher)
- `BreadcrumbList` — tentang, kontak, berita (listing + 15 pagination), cek-resi, 5 cek-harga, 512 SEO city pages

---

## Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 2026-06-04 | Audit awal — 10 critical issues identified |
| 2026-06-04 | ✅ Fixed #6 — Homepage title & description (company.ts) |
| 2026-06-04 | ✅ Fixed #2 — 6 pages dapat unique title & description (kontak, cek-resi, 5x cek-harga, berita) |
| 2026-06-04 | ✅ Fixed #7 — 3 blog metaDescription "Papandayan Cargo" → "Terminal Cargo Indonesia" |
| 2026-06-04 | ✅ Fixed tentang page title & description |
| 2026-06-04 | ✅ Fixed #4 — Title suffix "— Terminal Cargo Indonesia" → "| TCI" (hemat 23 chars) |
| 2026-06-04 | ✅ Fixed #1 — 512 SEO city pages dapat dynamic meta description (~147 chars) |
| 2026-06-04 | ✅ Fixed #5 — SEO city title turun ke ~60-70 chars (dari 85-100+) |
| 2026-06-04 | ✅ Fixed #8-10 — og:locale, Twitter meta tags, robots meta added to BaseLayout |
| 2026-06-04 | ✅ Fixed #3 — JSON-LD: Article schema for 136 blog articles + BreadcrumbList for all pages (berita, cek-resi, cek-harga, SEO city) |
