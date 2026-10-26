# 🐼 Playora

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
| 🎧 Tips Keibubapaan | 12 | Masa skrin, membaca bersama, tidur, tantrum, emosi, dwibahasa, keselamatan digital, rehat ibu — dengan pemain audio (TTS, kelajuan, sorotan). |

Juga: akaun ibu/bapa, **berbilang profil anak**, bintang → 30 pelekat + 10 lencana, laporan kemajuan (boleh cetak), tetapan bunyi/suara, mod luar talian (service worker).

## Jalankan secara lokal

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

Tanpa konfigurasi, app berjalan dalam **Mod Demo**: akaun & data disimpan dalam pelayar (localStorage). Sesuai untuk cuba/demo.

## Sambung Supabase (data sebenar merentas peranti)

1. Cipta projek Supabase (projek dev semasa: `playora-dev`, rantau Singapura).
2. Jalankan migrasi **mengikut turutan** dalam `supabase/migrations/` (SQL Editor, atau `supabase db push`).
   Semuanya idempoten dan **tiada `DROP`/padam data** — selamat dijalankan semula.
   | Fail | Isi |
   |---|---|
   | `…0001_baseline` | anak, kemajuan, data kunci/nilai, maklum balas + RLS |
   | `…0002_learning_platform` | profil, admin, katalog aktiviti + audit, `learning_attempts`, RPC `record_attempt` (skor disahkan pelayan), `child_stats`, kegemaran, matlamat mingguan, had 10 anak |
   | `…0003_seed_activities` | 36 keluarga aktiviti (dijana: `node scripts/gen-activities-seed.mjs`) |
   | `…0004_feedback_hardening` | maklum balas: tulis sahaja melalui API |
   | `…0005_advisor_fixes` | pembetulan advisor Supabase (fungsi pencetus tidak boleh dipanggil, indeks FK) |
   | `…0006_delete_account` | RPC `delete_my_account()` — ibu/bapa padam akaun sendiri; semua data keluarga dipadam secara cascade |
3. **Authentication → URL Configuration**: *Site URL* = alamat app (cth. `https://adib2024.github.io/kidedu/`), dan tambah URL yang sama dalam *Redirect URLs* (pengesahan emel & reset kata laluan).
4. Beri peranan admin (tiada laluan API untuk ini — sengaja):
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'emel-anda@contoh.com';
   ```
5. Uji RLS pada projek sebenar: tampal `tests/db/live-smoke.sql` dalam SQL Editor. Ia berjalan dalam satu transaksi yang **digulung balik** — tiada data ujian tertinggal.

**Bagaimana kemajuan dilindungi:** klien tidak boleh menulis jadual `progress`/`learning_attempts` secara terus. Setiap keputusan dihantar ke `record_attempt()` yang menyemak pemilikan anak, aktiviti diterbitkan, tahap sah, had skor, **mengira semula skor daripada log jawapan**, mengira bintang & XP sendiri (XP hanya untuk bintang *baharu*; 5 XP penyertaan untuk 30 percubaan pertama sehari) dan mengehadkan kadar (5 s / aktiviti, 40 percubaan / 10 minit). Had: aktiviti surih/mewarna dinilai di peranti (kanvas), jadi bintangnya (0–3) diterima seadanya dalam had tersebut.

## Deploy (GitHub Pages)

Workflow `.github/workflows/deploy.yml` menjalankan semakan + ujian unit + ujian pangkalan data, kemudian membina `_site` (`scripts/build-site.mjs`) dan deploy.

Sekali sahaja:
1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. Nilai Supabase (awam) untuk projek `playora-dev` sudah ditetapkan sebagai lalai dalam `.github/workflows/deploy.yml`. Untuk projek lain, tetapkan `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` dalam **Settings → Secrets and variables → Actions → Variables** (atau Secrets) — ia mengatasi nilai lalai.
3. Push ke cawangan, atau jalankan workflow secara manual (Actions → Deploy to GitHub Pages → Run workflow).

`build-site.mjs` **menolak** kunci `sb_secret_…` atau JWT selain `anon`, jadi kunci rahsia tidak boleh terdedah secara tidak sengaja.

**Rollback:** Actions → pilih larian deploy terdahulu yang berjaya → *Re-run jobs* (atau `git revert` commit bermasalah dan push). Migrasi pangkalan data hanya menambah objek; jika perlu berpatah balik, nyahterbit aktiviti melalui halaman admin atau tulis migrasi pembetulan baharu — jangan sunting migrasi yang telah digunakan.

## Ujian & semakan

Tiada dependency npm (Node 20+; E2E perlukan Chrome/Chromium; ujian DB perlukan binari PostgreSQL).

```bash
npm run check      # sintaks, import, fail luar talian, CSP, imbasan rahsia ("build")
npm test           # ujian unit: penjana soalan, storan, auth, ganjaran/XP, misi, cadangan
npm run test:db    # migrasi + 36 semakan RLS/RPC (dibenarkan & ditolak) pada PostgreSQL sementara
npm run test:e2e   # 32 senario E2E Chromium, termasuk mod Supabase (pelayan tiruan meniru peraturan SQL)
npm run verify     # semua di atas
```

## Keselamatan & privasi

- **RLS Supabase** pada setiap jadual: ibu/bapa hanya membaca/menulis data sendiri; kemajuan hanya melalui `record_attempt()`; admin dalam jadual yang tidak boleh ditulis melalui API; perubahan kandungan diaudit.
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
js/progression.js        — XP/tahap, misi, matlamat mingguan, titik lemah, cadangan (fungsi tulen)
supabase/migrations/     — migrasi berversi (tanpa DROP, idempoten)
scripts/check.mjs        — semakan statik ("build")
scripts/build-site.mjs   — bina _site untuk deploy (config.js dari pembolehubah persekitaran)
scripts/gen-activities-seed.mjs, scripts/activity-catalog.mjs — benih katalog aktiviti
tests/unit, tests/db, tests/e2e — ujian
```

## Nota

- Bacaan suara guna Web Speech API pelayar; kualiti suara BM bergantung pada peranti (Android/Chrome biasanya ada suara Bahasa Melayu/Indonesia).
- Pembayaran/premium & affiliate **tidak dilaksanakan** (keputusan produk). Untuk menambahnya kelak: gateway (cth: ToyyibPay/Billplz) + webhook pelayan (Supabase Edge Function) yang mengesahkan bayaran sebelum memberi hak akses — jangan sekali-kali bergantung pada mesej "berjaya" di pihak klien.
- Kunci `localStorage` bermula dengan `ppl_` (warisan nama lama) sengaja dikekalkan supaya data pengguna sedia ada tidak hilang.
