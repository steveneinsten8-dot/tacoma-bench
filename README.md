# Tacoma — GitHub Actions bench

Tes render Tacoma Narrows (Remotion + three.js, 1080x1920, 30 fps) di
GitHub Actions, untuk membandingkan kecepatannya dengan InstaBox.

Proyek ini = copy `tacoma-short` (src + package.json + remotion.config.ts),
tanpa `node_modules`, tanpa `out/`, tanpa audio. Render di sini bisu
(silent) — yang diukur murni kecepatan frame.

## Yang harus dilakukan (sekali saja)

1. Buat repo **PUBLIC** baru di GitHub (misal `tacoma-bench`).
   Harus public: runner public dapat 4 vCPU / 16 GB + menit unlimited.
   Repo private cuma dapat 2 vCPU / 8 GB + 2.000 menit/bulan.
2. Upload isi folder ini ke repo itu (atau `git push`).
3. Buka tab **Actions** di repo itu.

## Tes 30 frame

Actions → **Bench 30 frames Tacoma** → Run workflow.

- Default frame `0-29`, concurrency `2`, fast props
  (lens/bloom/MSAA/shadows off) — sama persis seperti di InstaBox.
- Selesai: lihat Summary / `bench-result.txt` di Artifact.
  Bandingkan dengan InstaBox:
  - InstaBox cepat: ~12 detik/frame, lambat: ~40-50 detik/frame
  - Colab T4 (Remotion, software): ~55-60 detik/frame

## Kalau bench bagus → render chunk penuh

Actions → **Render chunk Tacoma** → Run workflow → isi chunk 0-7.

- 1 job = 1 chunk (300 frame, kecuali chunk 7 = 150 frame).
- 1 job maksimal 6 jam di GitHub. Chunk 300 frame harus selesai
  di bawah itu, kalau tidak job-nya di-cut dan gagal.
- Maks 20 job barengan di plan Free, jadi semua chunk bisa jalan paralel.
- Hasil di Artifact (retention 7 hari), per chunk ~15-20 MB.

**Jangan** jalankan chunk yang sudah selesai / masih jalan di InstaBox
sampai bench terbukti — 2026-11-26 ~00:00 WIB, InstaBox tinggal
chunk 0 dan 6, sisanya sudah verified.
