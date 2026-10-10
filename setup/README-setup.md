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

Kedua script menyalin `.env.example` ke `.env` jika `.env` belum ada.
Isi `SECRET_KEY`, `GITHUB_TOKEN`, dan variabel lain, lalu jalankan:

```bash
docker compose up -d
```

`.env` diabaikan oleh git. Jangan pernah commit secret.

## Commit message (Commitizen)

Repo ini memakai [Conventional Commits](https://www.conventionalcommits.org/) lewat
[Commitizen](https://commitizen-tools.github.io/commitizen/). Script setup memasang `cz`
dan mengaktifkan hook `.githooks/commit-msg` (`git config core.hooksPath .githooks`),
jadi commit dengan format salah akan ditolak.

```bash
cz commit        # buat commit secara interaktif
cz bump          # naikkan versi + tag + update CHANGELOG.md
```

Contoh pesan valid: `feat(collector): tambah DNS collector`, `fix(api): perbaiki pagination`.
