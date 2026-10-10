# OSINT Intelligence Platform

> **One target in. Intelligence graph out.**

Platform OSINT berbasis web yang menerima satu target (username, email, domain, IP,
URL, organisasi, atau nomor telepon), lalu secara otomatis mengumpulkan informasi
publik dari banyak sumber, menormalisasinya, dan menghubungkannya menjadi satu
**intelligence graph** yang berbukti, bisa ditelusuri, dan bisa diekspor sebagai laporan.

Dokumen PRD lengkap: lihat *PRD — OSINT Intelligence Platform* (Claude Docs).

---

## ⚠️ Penggunaan yang bertanggung jawab

Alat ini hanya untuk **tujuan sah** dan **dengan izin yang diperlukan**:
riset threat intelligence, due diligence berbasis sumber publik, recon pada scope
yang sudah diizinkan klien, serta edukasi.

**Dilarang** dipakai untuk stalking, doxxing, melecehkan atau menyakiti individu,
mengakses data yang bocor/dicuri secara tidak sah, atau recon tanpa izin.
Pengguna wajib menyetujui *Acceptable Use Policy* dan mematuhi UU PDP (UU No. 27/2022),
GDPR bila relevan, serta Terms of Service tiap sumber data. Setiap tindakan tercatat
di audit log.

---

## Fitur (MVP)

- **One-click investigation** — masukkan target, collector relevan dipilih & dijalankan otomatis.
- **Intelligence graph** — node (entity) & edge (relationship) interaktif: zoom, expand, filter, isolate, shortest path.
- **Evidence & provenance** — setiap data punya sumber, collector, timestamp, dan bukti mentah (append-only).
- **Confidence system** — HIGH / MEDIUM / LOW / UNKNOWN per entity dan relationship.
- **Search, timeline, evidence view** — telusuri investigasi lintas waktu & tipe.
- **Job system + real-time updates** — collector berjalan di latar, status via WebSocket/SSE.
- **Report export** — PDF, HTML, Markdown, JSON, CSV.
- **Scope & limit** — `max_depth`, `max_entities`, `max_runtime` agar discovery tidak liar.
- **Audit log + autentikasi** — Argon2id, sesi aman, 2FA opsional.

### Collector inti MVP

| Collector | Input | Output utama |
| --- | --- | --- |
| DNS | domain | subdomain, IP, MX, NS |
| RDAP/WHOIS | domain, IP | registrar, org, tanggal |
| Certificate (CT) | domain | subdomain, cert, SAN |
| HTTP metadata | domain, URL | title, header, teknologi |
| Username | username | keberadaan profil publik |
| GitHub | username, org | repo, org, email commit, domain |

---

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

Pipeline: `TARGET → DISCOVERY → COLLECTION → NORMALIZATION → CORRELATION → GRAPH → ANALYSIS → REPORT`.

---

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

---

## Mulai (rencana)

> Catatan: ini kerangka yang diharapkan saat implementasi dimulai; sesuaikan dengan repo nyata.

```bash
# 1. Salin konfigurasi
cp .env.example .env
#    isi: SECRET_KEY, DATABASE_URL, REDIS_URL, GITHUB_TOKEN, dll.

# 2. Jalankan seluruh stack
docker compose up -d

# 3. Buka
#    Frontend : https://localhost
#    API docs : https://localhost/api/docs
```

### Variabel lingkungan utama

| Variabel | Fungsi |
| --- | --- |
| `SECRET_KEY` | Kunci sesi/JWT |
| `DATABASE_URL` | Koneksi PostgreSQL |
| `REDIS_URL` | Koneksi Redis (job queue) |
| `GITHUB_TOKEN` | Token API GitHub (hormati rate limit) |
| `MAX_DEPTH` / `MAX_ENTITIES` / `MAX_RUNTIME` | Limit discovery default |

---

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

---

## Scope control (contoh)

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

---

## Menulis collector baru

Setiap collector adalah plugin dengan interface standar: menerima input, mengembalikan
hasil ternormalisasi.

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

Letakkan di `collectors/<nama>/`. **Setiap collector baru wajib lolos review ToS/legal**
sebelum diaktifkan.

---

## Roadmap

- **v1.0 (MVP)** — 6 collector inti, graph, evidence, report, scope, audit.
- **v1.1** — lebih banyak collector, advanced search, scheduled investigations.
- **v1.2** — correlation engine, entity similarity, automated discovery, risk scoring.
- **v2.0** — multi-user, kolaborasi tim, CLI, Python SDK, marketplace collector.

---

## Lisensi

Tentukan sebelum rilis (mis. MIT/Apache-2.0). Pastikan lisensi selaras dengan
kebijakan sumber data dan penggunaan yang bertanggung jawab di atas.