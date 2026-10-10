# OSINT Intelligence Platform

Masukkan satu target, dapatkan satu intelligence graph.

Ini platform OSINT berbasis web. Kamu kasih satu target (username, email, domain, IP, URL, organisasi, atau nomor telepon), lalu platform mengumpulkan informasi publik tentang target itu dari banyak sumber, merapikan formatnya, dan menyambungkan semuanya jadi satu graph. Setiap data di graph punya bukti asalnya, bisa ditelusuri, dan bisa diekspor jadi laporan.

Detail lengkapnya ada di [docs/PRD.md](docs/PRD.md).

## Pakai dengan bertanggung jawab

Alat ini hanya untuk tujuan yang sah dan dengan izin yang diperlukan: riset threat intelligence, due diligence dari sumber publik, recon pada scope yang sudah diizinkan klien, dan belajar.

Jangan pakai untuk stalking, doxxing, melecehkan atau menyakiti orang, mengakses data bocor atau curian, atau recon tanpa izin. Setiap user wajib menyetujui *Acceptable Use Policy* dan mematuhi UU PDP (UU No. 27/2022), GDPR kalau relevan, serta Terms of Service tiap sumber data. Semua tindakan tercatat di audit log.

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [docs/PRD.md](docs/PRD.md) | Kebutuhan produk: tujuan, fitur, data model, keamanan, roadmap |
| [docs/setup.md](docs/setup.md) | Menyiapkan lingkungan development dan menjalankan service |
| [docs/contributing.md](docs/contributing.md) | Alur kerja: branch, commit, pull request |
| [docs/commit-guide.md](docs/commit-guide.md) | Format commit dan cara pakai `npm run commit` |

## Fitur MVP

- One-click investigation. Masukkan target, dan platform memilih serta menjalankan collector yang cocok.
- Intelligence graph interaktif berisi node (entity) dan edge (relationship). Bisa zoom, expand, filter, isolate, dan cari shortest path.
- Evidence dan provenance. Setiap data menyimpan sumber, collector, timestamp, dan bukti mentahnya (append-only).
- Confidence HIGH / MEDIUM / LOW / UNKNOWN untuk tiap entity dan relationship.
- Search, timeline, dan evidence view untuk menelusuri investigasi dari waktu ke waktu.
- Job system dengan update real-time. Collector jalan di belakang, statusnya dikirim lewat WebSocket/SSE.
- Ekspor laporan ke PDF, HTML, Markdown, JSON, dan CSV.
- Scope dan limit (`max_depth`, `max_entities`, `max_runtime`) supaya discovery tidak liar.
- Audit log dan autentikasi: Argon2id, sesi aman, 2FA opsional.

### Collector inti MVP

| Collector | Input | Output utama |
| --- | --- | --- |
| DNS | domain | subdomain, IP, MX, NS |
| RDAP/WHOIS | domain, IP | registrar, org, tanggal |
| Certificate (CT) | domain | subdomain, cert, SAN |
| HTTP metadata | domain, URL | title, header, teknologi |
| Username | username | keberadaan profil publik |
| GitHub | username, org | repo, org, email commit, domain |

## Arsitektur

```
Internet (HTTPS)
      │
Reverse proxy (Caddy/Nginx)
      │
Frontend (React + TypeScript)
      │  REST API
FastAPI ─────────────┬───────────────┐
      │              │               │
 PostgreSQL        Redis         Object storage
 (graph)         (job queue)        (MinIO)
                     │
                  Workers
                     │
          Collectors (sandbox/container terisolasi)
```

Alurnya: `TARGET → DISCOVERY → COLLECTION → NORMALIZATION → CORRELATION → GRAPH → ANALYSIS → REPORT`.

## Tech stack

| Layer | Teknologi |
| --- | --- |
| Frontend | React + TypeScript, Tailwind CSS |
| Graph | React Flow / Cytoscape |
| Backend/API | FastAPI (Python) |
| Worker | Python |
| Queue | Redis |
| Database | PostgreSQL |
| Object storage | MinIO |
| Reverse proxy | Caddy / Nginx |
| Container | Docker |
| Auth | Session / JWT |

## Mulai development

Pasang dulu prasyaratnya (git, Python, Node.js, Docker, tool commit) pakai script di folder `setup/`. Caranya ada di [docs/setup.md](docs/setup.md).

Setelah itu:

```bash
# 1. Salin konfigurasi, lalu ganti password dan isi SECRET_KEY, GITHUB_TOKEN, dll.
cp .env.example .env

# 2. Jalankan PostgreSQL, Redis, dan MinIO
docker compose up -d
```

Saat ini `docker-compose.yml` baru berisi infrastrukturnya. API, worker, frontend, dan reverse proxy akan ditambahkan begitu kodenya ada.

### Variabel lingkungan utama

Daftar lengkapnya ada di `.env.example`.

| Variabel | Fungsi |
| --- | --- |
| `SECRET_KEY` | Kunci sesi/JWT |
| `DATABASE_URL` | Koneksi PostgreSQL |
| `REDIS_URL` | Koneksi Redis (job queue) |
| `GITHUB_TOKEN` | Token API GitHub (hormati rate limit) |
| `MAX_DEPTH` / `MAX_ENTITIES` / `MAX_RUNTIME` | Limit discovery default |

## API (ringkas)

```
POST   /api/auth/login
GET    /api/investigations
POST   /api/investigations
GET    /api/investigations/{id}
POST   /api/investigations/{id}/targets
GET    /api/entities         GET /api/entities/{id}
GET    /api/relationships
POST   /api/jobs             GET /api/jobs/{id}
GET    /api/collectors
POST   /api/reports
```

## Contoh scope

```yaml
scope:
  domains:
    - example.com
    - "*.example.com"
limits:
  max_depth: 3
  max_entities: 500
  max_runtime: 10m
```

## Menulis collector baru

Setiap collector adalah plugin dengan interface standar. Collector menerima input dan mengembalikan hasil yang sudah dinormalisasi, seperti ini:

```json
{
  "entity":   { "type": "domain", "value": "example.com" },
  "source":   "dns",
  "collector": "dns@1.0",
  "confidence": "HIGH",
  "collected_at": "2026-10-08T15:42:00+09:00",
  "relationships": [
    { "type": "RESOLVES_TO", "target": { "type": "ip", "value": "93.184.216.34" } }
  ],
  "evidence": { "kind": "dns_record", "raw": "A 93.184.216.34" }
}
```

Taruh collector di `collectors/<nama>/`. Sebelum diaktifkan, setiap collector baru harus lolos review ToS dan legal.

## Roadmap

- v1.0 (MVP): 6 collector inti, graph, evidence, report, scope, audit.
- v1.1: lebih banyak collector, advanced search, scheduled investigations.
- v1.2: correlation engine, entity similarity, automated discovery, risk scoring.
- v2.0: multi-user, kolaborasi tim, CLI, Python SDK, marketplace collector.

## Lisensi

[MIT](LICENSE). Lisensi kode tidak mengubah aturan pemakaian di atas: kamu tetap wajib mematuhi hukum dan Terms of Service tiap sumber data.
