# Kontribusi

Panduan singkat supaya kerja bareng di repo ini tidak saling tabrak.

## Sebelum mulai

1. Siapkan lingkungan development sesuai [setup.md](setup.md).
2. Baca [PRD.md](PRD.md), terutama bagian use case yang dilarang dan kepatuhan hukum. Fitur yang bertentangan dengan bagian itu tidak akan di-merge.

## Branch

`main` selalu dalam kondisi bisa jalan. Jangan push langsung ke `main`; kerjakan di branch sendiri lalu buka pull request.

Nama branch: `<type>/<topik-singkat>`, dengan type yang sama seperti di commit.

```bash
git switch main && git pull
git switch -c feat/dns-collector
```

Contoh lain: `fix/api-pagination`, `docs/setup-macos`, `wip/graph-layout`.

## Commit

Pakai `npm run commit`. Formatnya `type(scope): <emoji> [nama] subject`, dan hook akan menolak pesan yang formatnya salah. Detailnya di [commit-guide.md](commit-guide.md).

Commit kecil dan sering lebih mudah direview daripada satu commit besar. Commit `wip` boleh dipakai di branch sendiri untuk menyimpan progres.

## Pull request

1. Update branch dengan `main` terbaru sebelum membuka PR (`git pull --rebase origin main`).
2. Judul PR mengikuti format commit, misalnya `feat(collector): ✨ [kodok] tambah DNS collector`.
3. Di deskripsi, tulis apa yang berubah, kenapa, dan cara mengetesnya.
4. Minimal satu orang lain mereview sebelum merge.

Collector baru wajib lolos review ToS dan legal sebelum diaktifkan. Di deskripsi PR, sebutkan sumber datanya, cara aksesnya (API resmi, data publik), dan batas rate yang dipakai.

## Yang tidak boleh masuk repo

- File `.env` dan secret apa pun (token, password, key). Pakai `.env.example` untuk contoh nilai.
- Data hasil investigasi, evidence, atau laporan, apalagi yang berisi data pribadi orang sungguhan.
