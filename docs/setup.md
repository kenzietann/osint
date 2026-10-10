# Setup lingkungan development

Script ini memasang prasyarat: **git, Python 3, Node.js + npm, Docker + Docker Compose**.
PostgreSQL, Redis, dan MinIO dijalankan lewat `docker compose`, jadi tidak dipasang langsung.

## Linux (Fedora / Debian / Ubuntu / Arch)

```bash
bash setup/linux-setup.sh
```

Setelah selesai, logout lalu login lagi agar `docker` bisa dipakai tanpa `sudo`.

## macOS

Klik dua kali `setup/setup-mac-os.command` di Finder, atau:

```bash
chmod +x setup/setup-mac-os.command
./setup/setup-mac-os.command
```

Homebrew dipasang otomatis bila belum ada. Docker Desktop perlu dibuka sekali
dan disetujui izinnya.

## Setelah setup

Kedua script juga menjalankan `npm install` (memasang hook commit) dan menyalin
`.env.example` ke `.env` kalau `.env` belum ada. Ganti password di `.env`, isi
`SECRET_KEY` dan `GITHUB_TOKEN`, lalu jalankan:

```bash
docker compose up -d
```

Kalau `POSTGRES_PASSWORD` diganti, ganti juga password di dalam `DATABASE_URL` supaya sama.

| Service | Alamat | Login |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | `POSTGRES_USER` / `POSTGRES_PASSWORD` |
| Redis | `localhost:6379` | tanpa password |
| MinIO (S3 API) | `http://localhost:9000` | `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` |
| MinIO (web console) | `http://localhost:9001` | sama dengan di atas |

Semua port hanya bisa diakses dari mesin sendiri. Bucket `osint-evidence` belum dibuat
otomatis; buat sekali lewat web console MinIO.

`.env` diabaikan oleh git. Jangan pernah commit secret.

## Commit

Format commit dan cara pakai `npm run commit` ada di [commit-guide.md](commit-guide.md).
