# 🐼 Pelangi Pop Land

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

## Struktur

```
index.html, config.js, manifest.webmanifest, sw.js
css/style.css            — design system
js/main.js               — router, shell, auth, hub, anak, ganjaran, laporan, tetapan
js/store.js              — lapisan data: Mod Demo (localStorage) / Supabase REST
js/engine.js             — enjin kuiz, keputusan, memory, objek tersembunyi
js/data/*                — kosa kata, penjana soalan, games, peta, buku, gambar, tips
js/pages/*               — setiap seksyen
supabase/schema.sql      — skema pangkalan data
```

## Nota

- Bacaan suara guna Web Speech API pelayar; kualiti suara BM bergantung pada peranti (Android/Chrome biasanya ada suara Bahasa Melayu/Indonesia).
- Pembayaran & sistem affiliate belum disertakan (boleh ditambah kemudian, cth: ToyyibPay/Billplz + jadual `orders`/`referrals`).
