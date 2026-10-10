# Panduan Commit: cz-git + commitlint

## Ringkasan

Setiap commit di repo OSINT pakai format `type(scope): <emoji> [nama] subject`. Dari `git log --oneline` langsung kelihatan siapa mengerjakan apa, dan apakah itu fitur, perbaikan, atau masih setengah jadi.

```
feat(collector): ✨ [kodok] tambah DNS collector
fix(api): 🐛 [budi] perbaiki pagination
wip(graph): 🚧 [kodok] layout node masih berantakan
```

Kamu tidak perlu mengetik format ini sendiri. `npm run commit` membuka menu (czg) yang menyusun pesannya, termasuk emoji dan nama. Hook commitlint (dipasang husky) menolak commit yang formatnya salah. Aturannya ada di `commitlint.config.js`.

## Setup sekali

Cukup dilakukan sekali per clone repo. Butuh Node.js dan npm.

1. Jalankan script setup (`bash setup/linux-setup.sh` atau `setup/setup-mac-os.command`). Kalau prasyarat sudah terpasang, cukup jalankan `npm install` di root repo.
2. `npm install` juga menjalankan script `prepare`, yang memasang hook husky ke `.husky/`. Cek dengan `git config core.hooksPath`; hasilnya harus `.husky/_`.
3. Atur nama yang muncul di tag. Default-nya `git config user.name`. Kalau mau nama pendek:

```bash
git config cz.name kodok
```

Perintah di atas hanya berlaku untuk repo ini dan tidak mengubah nama author commit.

## Cara commit

1. Stage perubahan seperti biasa: `git add <file>` atau `git add -A`.
2. Jalankan `npm run commit`.
3. Pilih type pakai panah atas/bawah, lalu Enter. Daftar type ada di bagian berikutnya.
4. Isi scope, yaitu area yang diubah (`api`, `collector`, `graph`, `setup`). Boleh dikosongkan.
5. Tulis subject: kalimat pendek tentang apa yang dikerjakan. Jangan ketik emoji atau nama, keduanya ditambahkan otomatis.
6. Body opsional, untuk penjelasan lebih panjang. Pakai `|` untuk baris baru.
7. Untuk `feat` dan `fix`, kamu akan ditanya apakah ada breaking change. Kalau tidak ada, lewati saja.
8. Periksa pratinjau pesannya, lalu pilih yes. Hook commitlint mengecek pesan itu, lalu commit dibuat.

Hasilnya, misalnya: `feat(collector): ✨ [kodok] tambah DNS collector`.

## Daftar type

Pakai `wip` untuk pekerjaan yang belum selesai tapi perlu disimpan atau dibagikan, supaya tim tahu bagian itu sedang dipegang seseorang.

| Type | Emoji | Kapan dipakai |
| --- | --- | --- |
| `feat` | ✨ | Fitur baru |
| `fix` | 🐛 | Perbaikan bug |
| `wip` | 🚧 | Masih dikerjakan, belum selesai |
| `docs` | 📝 | Dokumentasi (README, PRD, komentar) |
| `style` | 💄 | Format atau tampilan, tanpa ubah logika |
| `refactor` | ♻️ | Ubah struktur kode, tanpa fitur baru atau fix |
| `perf` | ⚡ | Peningkatan performa |
| `test` | ✅ | Tambah atau ubah test |
| `build` | 📦 | Build system atau dependency |
| `ci` | 🎡 | CI/CD |
| `chore` | 🔨 | Tugas lain yang tidak masuk kategori di atas |
| `revert` | ⏪ | Membatalkan commit sebelumnya |

## Contoh pesan

Hasil tes hook di repo ini:

| Pesan | Hasil | Alasan |
| --- | --- | --- |
| `feat(collector): ✨ [kodok] tambah DNS collector` | Diterima | Format lengkap |
| `wip(graph): 🚧 [kodok] layout node` | Diterima | Format lengkap |
| `refactor: ♻️ [budi] rapikan worker` | Diterima | Scope boleh kosong |
| `feat: tambah DNS collector` | Ditolak | Tanpa emoji dan tag nama |
| `feat: ✨ tambah DNS` | Ditolak | Tanpa tag nama |
| `random message` | Ditolak | Tidak ada type |

Kalau mau commit tanpa menu, ketik formatnya sendiri. Hook tetap mengecek pesannya:

```bash
git commit -m "docs(setup): 📝 [kodok] tambah panduan commit"
```

## Kalau ada masalah

| Masalah | Penyebab | Solusi |
| --- | --- | --- |
| Commit ditolak dengan pesan `subject harus diawali "<emoji> [nama] "` | Pesan diketik manual tanpa emoji atau tag | Pakai `npm run commit`, atau tambahkan `<emoji> [nama] ` di awal subject |
| Commit ditolak dengan `type must be one of ...` | Type tidak ada di daftar | Pilih salah satu type dari tabel di atas |
| Commit lolos tanpa dicek | Hook belum terpasang | Jalankan `npm install`, lalu cek `git config core.hooksPath` (harus `.husky/_`) |
| Nama di tag salah atau terlalu panjang | `cz.name` belum diatur | `git config cz.name <nama>` |
| Pesan sudah terlanjur salah di commit terakhir | | `git commit --amend`, lalu perbaiki pesannya |

Untuk melihat siapa mengerjakan apa:

```bash
git log --oneline                    # semua commit
git log --oneline --grep "\[kodok\]" # commit milik kodok
git log --oneline --grep "^wip"      # yang masih dikerjakan
```
