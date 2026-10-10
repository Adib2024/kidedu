# 🐼 Cilikopia

Platform pembelajaran kanak-kanak (BM/English) — **belajar sambil bermain** — dengan zon khas untuk ibu.
Web app statik (PWA) tanpa build step: HTML + CSS + JavaScript ES modules. Boleh dipasang ke skrin utama telefon.

## Kandungan (70 topik)

| Seksyen | Topik | Apa yang berfungsi |
|---|---|---|
| 🎮 Games Online | 9 | Bijak Sifir (13 tahap), Matematik 1 & 2, Buah-buahan, Warna, Cuaca, Learn English, Simpulan Bahasa (40), Ingat & Padan. Soalan dijana rawak, tahap dibuka berperingkat, bacaan suara. |
| 🗺️ Peta Kartun | 7 | Peta SVG berliku dengan stesen berkunci: membaca, objek tersembunyi (6 babak), duit Malaysia (syiling/wang kertas/baki), warna, matematik, jam & kalendar, sifir. |
| 📚 Buku Cerita | 11 | Cerita asli BM, baca automatik (TTS) dengan sorotan perkataan, swipe, pengajaran + kuiz kefahaman. |
| 🖍️ Pensel Warna Digital | 8 | Surih nombor/huruf/perkataan dengan **semakan automatik** (liputan & ketepatan → bintang), mewarna ikut nombor (disemak), arahan bentuk-warna, lukis bebas dengan cop, galeri. |
| 🖨️ Worksheet | 7 | Lembaran A4 dijana tanpa had: warna ikut nombor, kira & lukis, bentuk, surih perkataan (termasuk perkataan sendiri), colour the objects, meet the letter, latihan matematik + skema jawapan. |
| 💖 Games Ibu | 8 | Jurnal emosi + corak 7/30 hari, Bahasa Cinta, Karakter Ibu, Gaya Keibubapaan, vision board, jurnal luahan, cabaran Glow Up 30 hari, semakan "Ibu Okay Ke?" + talian bantuan. |
| 📒 Planner | 8 | Harian, penjejak tabiat bulanan, rutin anak (beri ⭐), jurnal syukur, matlamat, mood/tidur bulanan, jadual mingguan anak, menu & senarai belanja (dengan jumlah RM). |
| 🎧 Tips & Info | 12 | Artikel usahawan digital/affiliate dengan pemain audio (TTS, kelajuan, sorotan). |

Juga: akaun ibu/bapa, **berbilang profil anak**, bintang → 30 pelekat + 10 lencana, laporan kemajuan (boleh cetak), tetapan bunyi/suara, mod luar talian (service worker).

## Jalankan secara lokal

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

Tanpa konfigurasi, app berjalan dalam **Mod Demo**: akaun & data disimpan dalam pelayar (localStorage). Sesuai untuk cuba/demo.

## Sambung Supabase (login sebenar & segerak merentas peranti)

1. Cipta projek di [supabase.com](https://supabase.com).
2. Dashboard → **SQL Editor** → tampal & jalankan `supabase/schema.sql` (jadual + Row Level Security).
3. Dashboard → **Project Settings → API**: salin *Project URL* dan *publishable/anon key* ke `config.js`:
   ```js
   window.PPL_CONFIG = { SUPABASE_URL: "https://xxxx.supabase.co", SUPABASE_ANON_KEY: "sb_publishable_..." };
   ```
4. **Authentication → URL Configuration**: tetapkan *Site URL* kepada domain app anda (untuk pautan sahkan emel & reset kata laluan).

Kunci *anon/publishable* selamat diletak di frontend — semua data dilindungi RLS (setiap ibu/bapa hanya nampak data sendiri).

## Deploy

Mana-mana hosting statik: GitHub Pages, Netlify, Vercel, Cloudflare Pages. Muat naik semua fail apa adanya (tiada build). HTTPS diperlukan untuk PWA & service worker.

## Ujian & semakan

Tiada dependency npm diperlukan (Node 20+ sahaja; E2E perlukan Chrome/Chromium).

```bash
npm run check      # sintaks, import, fail luar talian (SW), CSP (tiada handler inline), imbasan rahsia
npm test           # ujian unit (node:test): penjana soalan, storan, auth demo, carian, utiliti
npm run test:e2e   # 27 senario E2E dalam Chromium headless, termasuk mod Supabase (pelayan tiruan)
npm run verify     # semua di atas
```

`CHROME_PATH=/path/to/chrome` untuk menukar pelayar E2E. CI GitHub Actions (`.github/workflows/ci.yml`) menjalankan ketiga-tiganya.

## Keselamatan & privasi

- **RLS Supabase** pada setiap jadual: ibu/bapa hanya membaca/menulis data sendiri; kemajuan hanya boleh ditulis untuk anak sendiri.
- **CSP** dalam `index.html`: skrip hanya dari domain sendiri, API hanya ke `*.supabase.co`, tiada pengendali inline.
- Semua teks pengguna dipaparkan selepas diloloskan (`esc()`) atau melalui `textContent`.
- Data anak yang disimpan: **nama panggilan, umur (pilihan), avatar & kemajuan** sahaja.
- Mod Demo: kata laluan disimpan sebagai hash PBKDF2 bergaram, dalam pelayar itu sahaja.
- Kunci *anon/publishable* Supabase memang untuk frontend; **jangan sekali-kali** letak kunci `service_role` dalam `config.js`.

## Struktur

```
index.html, config.js, manifest.webmanifest, sw.js
css/style.css            — design system
js/main.js               — router, shell, auth, hub (+carian), anak, ganjaran, laporan, tetapan, 404
js/feedback.js           — borang maklum balas penguji (db artifact claude.ai / Supabase)
js/store.js              — lapisan data: Mod Demo (localStorage) / Supabase REST
js/engine.js             — enjin kuiz, keputusan, memory, objek tersembunyi
js/data/*                — kosa kata, penjana soalan, games, peta, buku, gambar, tips
js/pages/*               — setiap seksyen
supabase/schema.sql      — skema pangkalan data (idempotent; selamat dijalankan semula)
scripts/check.mjs        — semakan statik ("build")
tests/unit, tests/e2e    — ujian
```

## Nota

- Bacaan suara guna Web Speech API pelayar; kualiti suara BM bergantung pada peranti (Android/Chrome biasanya ada suara Bahasa Melayu/Indonesia).
- Pembayaran/premium & affiliate **tidak dilaksanakan** (keputusan produk). Untuk menambahnya kelak: gateway (cth: ToyyibPay/Billplz) + webhook pelayan (Supabase Edge Function) yang mengesahkan bayaran sebelum memberi hak akses — jangan sekali-kali bergantung pada mesej "berjaya" di pihak klien.
- Kunci `localStorage` bermula dengan `ppl_` (warisan nama lama) sengaja dikekalkan supaya data pengguna sedia ada tidak hilang.
