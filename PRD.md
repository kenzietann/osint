# PRD — OSINT Intelligence Platform

Oct 8, 2026 · @kodok\\

## Ringkasan

Produk ini adalah platform OSINT berbasis web yang menerima satu target (username, email, domain, IP, URL, organisasi, atau nomor telepon) dan secara otomatis mengumpulkan informasi publik dari banyak sumber, menormalisasinya, lalu menghubungkannya menjadi satu *intelligence graph* yang bisa ditelusuri, diberi bukti (provenance), dan diekspor sebagai laporan. Prinsip produknya: **one target in, intelligence graph out.**

MVP menargetkan satu peneliti keamanan atau investigator yang bekerja sendiri, dengan enam collector inti (DNS, RDAP/WHOIS, Certificate Transparency, HTTP metadata, Username, GitHub), graph interaktif, sistem bukti dan confidence, antrian job dengan worker, ekspor laporan, dan audit log. Fitur kolaborasi multi-user, CLI, SDK, dan marketplace collector ditunda ke versi berikutnya.

Karena platform dapat menargetkan orang dan organisasi nyata, dokumen ini memperlakukan kepatuhan hukum (UU PDP Indonesia No. 27/2022, GDPR bila relevan), penghormatan terhadap Terms of Service sumber data, scope/authorization control, dan isolasi collector sebagai *requirement wajib*, bukan fitur tambahan.

| Field | Nilai |
| --- | --- |
| Product type | Web-based OSINT intelligence platform |
| Status | Product Definition / MVP scope |
| Versi dokumen | 1.0 (draf) |
| Akses | HTTPS, autentikasi wajib |
| Target user | Peneliti keamanan, investigator, analis threat intelligence, mahasiswa keamanan siber, pentester (authorized) |
| Platform | Web (desktop-first), containerized, deploy di Linux VPS |
| Bahasa dokumen | Indonesia |

## Visi, masalah, dan tujuan

**Visi.** Menyatukan proses OSINT yang hari ini tersebar di banyak tools terpisah (browser, terminal, WHOIS, DNS, Certificate Transparency, pencarian username, intelligence IP) ke dalam satu *investigation workspace*. User cukup memasukkan sebuah target; platform menentukan collector relevan, menjalankannya, dan menyajikan hasil sebagai graph berbukti.

**Masalah.** OSINT manual punya beberapa kelemahan yang berulang: informasi tersebar di banyak alat, output tiap alat berbeda format, hubungan antar-data sulit dilihat, bukti mudah hilang, dan investigasi sulit direproduksi karena terlalu banyak langkah manual. Akibatnya analis menghabiskan waktu untuk menyalin-tempel dan mengkorelasikan data, bukan untuk menganalisis.

**Tujuan (MVP).**

1. Satu target bisa diinvestigasi dengan satu klik dan menghasilkan graph dalam waktu wajar.
2. Setiap node di graph punya sumber, bukti, confidence, dan timestamp yang bisa ditelusuri.
3. Investigasi bisa disimpan, dilanjutkan, dan diekspor menjadi laporan.
4. Collector bersifat modular sehingga sumber baru bisa ditambahkan tanpa mengubah inti.
5. Discovery terbatasi scope dan depth sehingga tidak berubah menjadi scan tak terkendali.

**Non-goals (MVP).** Bukan active scanning/eksploitasi; bukan pembelian atau integrasi sumber data berbayar/komersial; bukan kolaborasi tim; bukan collector untuk data yang memerlukan pelanggaran ToS atau akses ilegal (mis. breach database tak sah). Platform hanya mengumpulkan informasi publik atau yang diizinkan.

### Metrik sukses

| Metrik | Target MVP |
| --- | --- |
| Waktu dari target ke graph pertama | < 60 detik untuk collector cepat (DNS, cert) |
| Entity ditemukan per investigasi domain | Median ≥ 15 node |
| Investigasi dengan bukti lengkap (semua node punya source) | 100% |
| Collector berjalan tanpa gagal | ≥ 95% job sukses |
| Reproduksibilitas (re-run target sama → graph konsisten) | ≥ 90% node sama |

## Persona & use case

### Persona

| Persona | Konteks | Kebutuhan utama |
| --- | --- | --- |
| Analis threat intelligence | Memetakan infrastruktur yang dipakai aktor/kampanye | Pivot cepat domain → IP → ASN → cert, bukti tersimpan |
| Investigator / due diligence | Memverifikasi identitas organisasi atau orang (dengan dasar sah) | Korelasi entity, timeline, laporan rapi |
| Pentester (authorized) | Fase recon pada scope yang sudah diizinkan klien | Scope control ketat, subdomain & aset publik |
| Mahasiswa / peneliti keamanan | Belajar OSINT secara terstruktur | Alur jelas, provenance, aman untuk latihan |

### Use case yang diizinkan

1. Recon aset milik sendiri atau klien dengan izin tertulis (scope).
2. Riset threat intelligence atas infrastruktur publik aktor jahat.
3. Due diligence atau verifikasi organisasi dari sumber publik.
4. Edukasi dan latihan OSINT pada target latihan/sendiri.

### Use case yang dilarang

Platform tidak boleh dipakai dan harus secara desain mempersulit: stalking atau pelecehan terhadap individu, doxxing, pengumpulan data untuk menyakiti seseorang, akses ke data yang bocor/dicuri secara tidak sah, atau recon terhadap target tanpa izin di luar yang diperbolehkan hukum. User wajib menyetujui *acceptable use policy* saat pertama memakai, dan setiap investigasi mencatat atribusi user (audit log).

> **Catatan penting bagi developer.** Garis antara "OSINT sah" dan "penyalahgunaan" sering kali terletak pada *izin* dan *tujuan*, bukan pada data itu sendiri. Karena itu scope, authorization prompt, acceptable use policy, dan audit log bukan fitur opsional — keempatnya adalah bagian dari definisi produk.

## Konsep inti

Alur kerja platform mengikuti satu pipeline tetap, dari target sampai laporan. Diagram pipeline ditempatkan di bawah bagian ini.

&#91;embedded content: pipeline OSINT · 8 tahap\]

### Target yang didukung

| Target | Contoh | Collector awal yang dipicu |
| --- | --- | --- |
| Username | `john_doe` | Username search, GitHub, social |
| Email | `john@example.com` | Domain extract, public mentions, repo refs |
| Domain | `example.com` | DNS, RDAP/WHOIS, certificate, HTTP metadata |
| IP | `8.8.8.8` | Reverse DNS, ASN, reputation publik |
| URL | `https://example.com` | HTTP metadata, teknologi, domain extract |
| Organization | `Example Corp` | Public search, domain discovery |
| Phone | nomor telepon | Public mentions (sesuai hukum) |
| Person | nama orang | Public search, social (dengan dasar sah) |

### Investigation

Setiap pencarian berada dalam sebuah **Investigation** yang menampung: *targets* (satu atau lebih), *entities* (hasil yang ternormalisasi), *relationships* (hubungan antar-entity), *evidence* (bukti per hasil), *jobs* (pekerjaan collector), dan *reports*. Investigation bisa disimpan dan dilanjutkan kapan saja, sehingga investigasi menjadi reproducible.

### Entity & relationship model

Semua informasi disimpan sebagai dua hal: **entity** (simpul) dan **relationship** (sisi berarah antar-entity). Model ini yang membuat hasil bisa dihubungkan lintas sumber.

**Tipe entity:** Person, Username, Email, Domain, Subdomain, IP, Organization, URL, Repository, Social Account, Certificate, ASN, Technology.

**Tipe relationship:** `OWNS`, `USES`, `REGISTERED_TO`, `RESOLVES_TO`, `HOSTED_ON`, `BELONGS_TO`, `AUTHORED`, `FOUND_ON`, `RELATED_TO`, `MENTIONS`, `LINKS_TO`, `HAS_SUBDOMAIN`.

## Kebutuhan fungsional

Tiap modul ditulis sebagai user story dengan acceptance criteria (AC) yang bisa diuji.

### F1 — One-click investigation

*Sebagai* analis, *saya ingin* memasukkan satu target dan menekan satu tombol *agar* platform otomatis memilih dan menjalankan collector yang relevan.

- AC1: Input target dideteksi tipenya otomatis (username/email/domain/IP/URL); tipe yang salah bisa dikoreksi manual.
- AC2: Menekan "Investigate" membuat Investigation baru dan men-enqueue job collector sesuai tipe.
- AC3: User melihat status tiap collector secara real-time (queued → running → completed/failed).
- AC4: Entity baru yang ditemukan bisa dijadikan target investigasi berikutnya (pivot) dengan satu klik.

### F2 — Intelligence graph

*Sebagai* analis, *saya ingin* melihat hasil sebagai graph interaktif *agar* bisa memahami hubungan antar-data.

- AC1: Graph menampilkan node (entity) dan edge (relationship) berlabel.
- AC2: Mendukung zoom, pan, expand, collapse, filter, cari node, isolate entity, dan shortest path antar-dua node.
- AC3: Klik node membuka panel detail: tipe, confidence, first seen, relationships, dan sumber/evidence.
- AC4: Node dengan confidence berbeda dibedakan secara visual.

### F3 — Evidence & provenance

*Sebagai* investigator, *saya ingin* tahu dari mana setiap informasi berasal *agar* hasil bisa dipertanggungjawabkan.

- AC1: Setiap entity dan relationship menyimpan: source, collector + versi, timestamp (JST/UTC), dan record bukti (URL/response).
- AC2: Dari node, user bisa menjawab pertanyaan "dari mana informasi ini?" dalam satu klik.
- AC3: Bukti tidak bisa diubah setelah dikumpulkan (append-only) dan ikut terekspor di laporan.

### F4 — Confidence system

*Sebagai* analis, *saya ingin* tiap informasi punya tingkat kepercayaan *agar* bisa memprioritaskan.

- AC1: Confidence bernilai HIGH / MEDIUM / LOW / UNKNOWN.
- AC2: Sumber terstruktur (mis. GitHub API) → HIGH; hasil pencarian → MEDIUM; kemiripan username → LOW.
- AC3: Confidence tampil di graph dan bisa dipakai sebagai filter.

### F5 — Search, timeline, evidence view

*Sebagai* analis, *saya ingin* mencari dan menelusuri investigasi lintas waktu.

- AC1: Global search mengembalikan hasil dikelompokkan per tipe (domain, IP, email, repo, people, relationship) dengan jumlah per grup.
- AC2: Timeline menampilkan urutan peristiwa investigasi dan bisa difilter per entity, source, collector, tanggal, confidence.
- AC3: Evidence view per entity menampilkan tipe, confidence, first seen, relationships, dan daftar sumber.

### F6 — Job system & real-time updates

*Sebagai* user, *saya ingin* collector berjalan di latar dan memberi update langsung.

- AC1: Job punya status QUEUED / RUNNING / COMPLETED / FAILED / CANCELLED dan bisa dibatalkan.
- AC2: Dashboard menerima update via WebSocket atau Server-Sent Events.
- AC3: Job yang gagal mencatat alasan dan tidak menggagalkan investigasi secara keseluruhan.

### F7 — Report export

*Sebagai* investigator, *saya ingin* mengekspor investigasi menjadi laporan.

- AC1: Ekspor ke PDF, HTML, Markdown, JSON, CSV.
- AC2: Laporan memuat: executive summary, target, entity ditemukan (domain, IP, akun, organisasi), relationships, timeline, evidence, sumber.
- AC3: Laporan menyertakan tanggal, versi collector, dan atribusi user.

### F8 — Scope & authorization control

*Sebagai* pemilik investigasi, *saya ingin* membatasi cakupan *agar* discovery tetap terarah dan sah.

- AC1: Tiap investigasi punya scope (domain yang diizinkan, wildcard) dan limit (`max_depth`, `max_entities`, `max_runtime`).
- AC2: Discovery berhenti saat limit tercapai dan memberi tahu user.
- AC3: Target di luar scope ditolak atau memerlukan konfirmasi eksplisit.

### F9 — Audit log

*Sebagai* admin, *saya ingin* semua tindakan penting tercatat.

- AC1: Log mencatat user, action, target, timestamp, result.
- AC2: Log bersifat append-only dan bisa ditinjau.

### F10 — Authentication & akun

*Sebagai* user, *saya ingin* akses yang aman.

- AC1: Login dengan password di-hash Argon2id, sesi aman, kedaluwarsa otomatis.
- AC2: 2FA opsional.
- AC3: User menyetujui acceptable use policy sebelum investigasi pertama.

## Collector framework

Platform harus modular: tiap sumber data adalah *collector* plugin dengan interface standar. Input masuk, collector memproses, keluar *normalized result*.

Struktur folder yang disarankan: `collectors/{username,email,domain,dns,ip,github,social,search,certificate,organization}/`. Setiap collector mendeklarasikan tipe input yang diterima, output entity/relationship yang dihasilkan, dan metadata (nama, versi, rate limit, confidence default).

Contoh bentuk hasil yang ternormalisasi:

```json
{
  "entity": { "type": "domain", "value": "example.com" },
  "source": "dns",
  "collector": "dns@1.0",
  "confidence": "HIGH",
  "collected_at": "2026-10-08T15:42:00+09:00",
  "relationships": [
    { "type": "RESOLVES_TO", "target": { "type": "ip", "value": "93.184.216.34" } }
  ],
  "evidence": { "kind": "dns_record", "raw": "A 93.184.216.34" }
}
```

### Katalog collector MVP

| # | Collector | Input | Output utama | Confidence default | Catatan legal/rate |
| --- | --- | --- | --- | --- | --- |
| 1 | DNS | domain | Subdomain, IP, MX, NS | HIGH | Query publik, hormati rate resolver |
| 2 | RDAP/WHOIS | domain, IP | Registrar, org, tanggal | HIGH | Utamakan RDAP; hormati rate & ToS |
| 3 | Certificate (CT) | domain | Subdomain, cert, SAN | HIGH | Dari CT log publik (crt.sh dsb.) |
| 4 | HTTP metadata | domain, URL | Title, header, teknologi | MEDIUM | Satu request sopan, hormati robots |
| 5 | Username | username | Keberadaan profil publik | LOW–MEDIUM | Cek keberadaan, bukan scraping isi |
| 6 | GitHub | username, org | Repo, org, email commit, domain | HIGH | Lewat API resmi + token, hormati rate |

Collector di luar enam ini (social, search umum, IP reputation lanjutan, phone) masuk roadmap, dengan syarat tiap penambahan lolos review legal/ToS.

### Discovery engine

Collector tidak hanya berjalan pada target awal; entity baru bisa memicu collector berikutnya (mis. `domain → subdomain → IP → ASN`). Agar tidak berubah menjadi scan tak terkendali, discovery **wajib** dibatasi scope dan limit:

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

Tujuan limit: mencegah runaway discovery, mengurangi beban API sumber, menjaga investigasi tetap terarah, dan membantu memastikan penggunaan yang authorized.

### Confidence system

Tidak semua informasi punya tingkat kepercayaan sama. Nilai: HIGH, MEDIUM, LOW, UNKNOWN. Pemetaan default: sumber terstruktur dengan API resmi (GitHub, RDAP, CT) → HIGH; metadata HTTP atau hasil pencarian → MEDIUM; sinyal heuristik seperti kemiripan username → LOW. Confidence disimpan per entity dan per relationship, tampil di graph, dan bisa dipakai memfilter.

## UX & layar utama

Antarmuka desktop-first dengan sidebar navigasi dan area kerja utama. Prinsip: user tidak perlu tahu collector mana yang harus dijalankan — cukup masukkan target, lalu baca graph.

| Layar | Isi utama | Aksi utama |
| --- | --- | --- |
| Dashboard | Kotak "New investigation", daftar investigasi terakhir | Mulai investigasi, buka investigasi |
| Investigation | Targets, entities, relationships, jobs, reports | Tambah target, pivot, lihat status real-time |
| Graph | Kanvas node + edge interaktif | Zoom, expand, filter, isolate, shortest path |
| Node detail | Tipe, confidence, first seen, relationships, sumber | "Dari mana ini?", pivot jadi target |
| Evidence | Daftar bukti per entity | Tinjau source & raw record |
| Timeline | Urutan peristiwa investigasi | Filter per entity/source/tanggal |
| Reports | Daftar & builder laporan | Ekspor PDF/HTML/MD/JSON/CSV |
| Collectors | Daftar collector + status/rate | Lihat konfigurasi collector |
| Settings | Akun, 2FA, scope default, AUP | Kelola keamanan & preferensi |

**Navigasi sidebar:** Dashboard · Investigations · Targets · Entities · Graph · Evidence · Reports · Collectors · Settings.

**Alur utama (happy path).** Dashboard → masukkan target → "Investigate" → lihat job berjalan real-time → graph terisi → klik node untuk detail & bukti → pivot bila perlu → ekspor laporan. Progress ditampilkan sebagai status per collector (mis. DNS selesai, Certificate selesai, GitHub selesai, Username search berjalan, Social discovery menunggu).

## Arsitektur, tech stack, data model, API

Arsitektur memisahkan frontend, API, penyimpanan, antrian job, dan worker collector. Worker menjalankan collector dalam sandbox/container terisolasi agar collector tidak punya akses penuh ke host. Diagram komponen ditempatkan di bawah bagian ini.

&#91;embedded content: arsitektur komponen · MVP\]

### Tech stack (MVP)

| Layer | Teknologi |
| --- | --- |
| Frontend | React + TypeScript |
| UI | Tailwind CSS |
| Graph | React Flow / Cytoscape |
| Backend/API | FastAPI (Python) |
| Worker | Python |
| Queue | Redis |
| Database | PostgreSQL |
| Object storage | MinIO |
| Reverse proxy | Caddy / Nginx |
| Container | Docker |
| Auth | Session / JWT |
| Deploy | Linux VPS |

### Data model

Tabel inti: `users`, `investigations`, `targets`, `entities`, `relationships`, `sources`, `evidence`, `jobs`, `collectors`, `reports`, `audit_logs`. Relasi inti: `entities` memiliki banyak `relationships` dan banyak `evidence`; tiap `evidence` menunjuk satu `source`; tiap `job` menghasilkan entity/relationship/evidence dan terikat ke satu `investigation`.

| Tabel | Kolom kunci | Keterangan |
| --- | --- | --- |
| users | id, email, password\_hash, created\_at | Argon2id, 2FA opsional |
| investigations | id, user\_id, name, scope, limits, status | Scope & limit di sini |
| targets | id, investigation\_id, type, value | Target awal / pivot |
| entities | id, investigation\_id, type, value, confidence, first\_seen | Simpul graph |
| relationships | id, from\_entity, to\_entity, type, confidence | Sisi graph |
| sources | id, name, kind | Katalog sumber |
| evidence | id, entity\_id, source\_id, collector, raw, collected\_at | Append-only |
| jobs | id, investigation\_id, collector, status, error | Antrian & status |
| collectors | id, name, version, input\_types, rate | Registry collector |
| reports | id, investigation\_id, format, created\_at | Hasil ekspor |
| audit\_logs | id, user\_id, action, target, result, ts | Append-only |

### REST API (first-class)

API adalah warga kelas satu agar platform bisa dipakai lewat Web UI, CLI, SDK, dan automation.

| Method & path | Fungsi |
| --- | --- |
| `POST /api/auth/login` | Autentikasi |
| `GET /api/investigations` | Daftar investigasi |
| `POST /api/investigations` | Buat investigasi |
| `GET /api/investigations/{id}` | Detail investigasi |
| `POST /api/investigations/{id}/targets` | Tambah target |
| `GET /api/entities` · `GET /api/entities/{id}` | Entity |
| `GET /api/relationships` | Relationship |
| `POST /api/jobs` · `GET /api/jobs/{id}` | Job |
| `GET /api/collectors` | Registry collector |
| `POST /api/reports` | Buat laporan |

## Non-fungsional, keamanan, privasi & kepatuhan

### Kebutuhan non-fungsional

| Aspek | Target |
| --- | --- |
| Keandalan | Satu collector gagal tidak menggagalkan investigasi |
| Skalabilitas | Worker bisa ditambah horizontal mengikuti beban job |
| Observability | Log terstruktur, metrik job, jejak error per collector |
| Portabilitas | Seluruh stack berjalan via Docker Compose di satu VPS |
| Maintainability | Collector sebagai plugin dengan interface stabil |

### Keamanan

**Autentikasi.** Password di-hash Argon2id, sesi aman dengan kedaluwarsa, 2FA opsional.

**Web.** HTTPS wajib, HSTS, proteksi CSRF, CORS ketat, cookie aman, rate limiting, dan validasi input menyeluruh.

**Collector.** Collector berjalan dalam sandbox/container tanpa akses penuh ke host, dengan timeout dan batas resource. Output collector diperlakukan sebagai data tidak tepercaya dan divalidasi sebelum masuk graph.

### Privasi & kepatuhan hukum (wajib)

Karena platform dapat mengumpulkan data tentang orang nyata, kepatuhan adalah bagian dari produk, bukan tambahan.

1. **UU PDP (Indonesia No. 27/2022).** Jika memproses data pribadi orang di Indonesia, perlu dasar pemrosesan yang sah, minimisasi data, dan mekanisme hapus data. Hormati prinsip tujuan yang spesifik dan sah.
2. **GDPR / regulasi lain.** Bila ada subjek data di yurisdiksi lain, patuhi aturan setempat (hak akses, hapus, dasar hukum).
3. **Terms of Service sumber.** Setiap collector hanya memakai akses yang diizinkan ToS sumber (mis. API resmi GitHub dengan token, CT log publik). Dilarang scraping yang melanggar ToS atau mem-bypass proteksi.
4. **Acceptable Use Policy.** User menyetujui AUP sebelum investigasi pertama: hanya untuk tujuan sah dan dengan izin yang diperlukan; dilarang stalking, doxxing, atau menyakiti individu.
5. **Data minimization & retensi.** Simpan hanya yang perlu; sediakan kebijakan retensi dan penghapusan investigasi beserta buktinya.
6. **Audit & atribusi.** Semua tindakan penting tercatat (user, action, target, timestamp, result) secara append-only.

> Rekomendasi: tampilkan *authorization prompt* saat memulai investigasi terhadap orang/organisasi, yang meminta user menegaskan dasar sah mereka. Ini mengubah keputusan etis menjadi langkah eksplisit yang terekam.

## Roadmap, risiko & glosarium

### Definisi MVP

MVP tidak perlu punya ratusan collector. Yang wajib ada:

- [ ] HTTPS + autentikasi
- [ ] Dashboard
- [ ] Investigation + target management
- [ ] Entity & relationship system
- [ ] Intelligence graph interaktif
- [ ] Evidence & provenance
- [ ] Confidence system
- [ ] Job queue + worker
- [ ] Collector plugin system (6 collector inti)
- [ ] Scope & limit
- [ ] Report export
- [ ] Audit log + AUP

### Roadmap versi

| Versi | Fokus | Isi utama |
| --- | --- | --- |
| v1.0 (MVP) | Inti berfungsi | 6 collector, graph, evidence, report, scope, audit |
| v1.1 | Perluasan | Lebih banyak collector, advanced search, graph lebih baik, scheduled investigations |
| v1.2 | Otomasi analisis | Correlation engine, entity similarity, automated discovery, risk scoring |
| v2.0 | Platform | Multi-user, kolaborasi tim, CLI, Python SDK, collector/API marketplace, integrasi automation |

### Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Penyalahgunaan (stalking/doxxing) | Hukum & reputasi | AUP, authorization prompt, audit log, batasi collector |
| Pelanggaran ToS sumber | Akses diblokir, risiko hukum | Review ToS per collector, pakai API resmi, hormati rate |
| Runaway discovery | Beban API, biaya, noise | Scope + max\_depth/entities/runtime wajib |
| Kualitas data rendah | Hasil menyesatkan | Confidence system, provenance, validasi output |
| Collector berbahaya | Kompromi host | Sandbox/container, batas resource, output tak tepercaya |

### Open questions

1. Sumber mana saja yang ToS-nya memperbolehkan pemakaian otomatis pada skala MVP?
2. Kebijakan retensi default untuk investigasi dan bukti berapa lama?
3. Apakah authorization prompt cukup, atau perlu verifikasi dasar hukum yang lebih kuat untuk target "person"?
4. Batas rate dan kuota per user untuk mencegah penyalahgunaan?

### Glosarium

| Istilah | Arti |
| --- | --- |
| Entity | Simpul di graph (domain, IP, email, dll.) |
| Relationship | Hubungan berarah antar-entity |
| Collector | Modul yang mengumpulkan data dari satu sumber |
| Provenance | Jejak asal sebuah informasi (sumber, waktu, bukti) |
| Confidence | Tingkat kepercayaan terhadap sebuah informasi |
| Pivot | Menjadikan entity hasil sebagai target baru |
| Scope | Batas cakupan investigasi (domain yang diizinkan) |
| Discovery | Perluasan otomatis dari entity ke entity baru |
