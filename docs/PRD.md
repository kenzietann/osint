# PRD: OSINT Intelligence Platform

Oct 8, 2026 · @kodok\\

## Ringkasan

Ini platform OSINT berbasis web. Kamu masukkan satu target (username, email, domain, IP, URL, organisasi, atau nomor telepon), lalu platform mengumpulkan informasi publik tentang target itu dari banyak sumber, merapikan formatnya, dan menyambungkan semuanya jadi satu *intelligence graph*. Setiap titik di graph punya bukti asal-usulnya (provenance), bisa ditelusuri, dan bisa diekspor jadi laporan. Singkatnya: satu target masuk, satu graph keluar.

Versi MVP ditujukan untuk satu peneliti keamanan atau investigator yang kerja sendiri. Isinya enam collector inti (DNS, RDAP/WHOIS, Certificate Transparency, HTTP metadata, Username, GitHub), graph interaktif, sistem bukti dan confidence, antrian job dengan worker, ekspor laporan, dan audit log. Kolaborasi multi-user, CLI, SDK, dan marketplace collector baru masuk di versi berikutnya.

Platform ini bisa diarahkan ke orang dan organisasi sungguhan. Karena itu ada beberapa hal yang wajib sejak awal: patuh hukum (UU PDP Indonesia No. 27/2022, dan GDPR kalau relevan), menghormati Terms of Service tiap sumber data, kontrol scope dan izin, serta isolasi collector.

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

### Visi

Sekarang ini kerja OSINT tersebar di banyak alat: browser, terminal, WHOIS, DNS, Certificate Transparency, pencarian username, intelligence IP. Kami ingin semuanya ada di satu *investigation workspace*. User cukup memasukkan target. Platform yang memilih collector yang cocok, menjalankannya, lalu menampilkan hasilnya sebagai graph lengkap dengan bukti.

### Masalah

OSINT manual punya masalah yang terus berulang. Informasinya tersebar di banyak alat dengan format output yang beda-beda, jadi hubungan antar-data susah dilihat. Bukti gampang hilang. Investigasi juga susah diulang karena langkah manualnya terlalu banyak. Ujungnya, analis lebih banyak copy-paste dan mencocokkan data sendiri daripada benar-benar menganalisis.

### Tujuan MVP

1. Satu target bisa diinvestigasi dengan satu klik dan menghasilkan graph dalam waktu yang wajar.
2. Setiap node di graph punya sumber, bukti, confidence, dan timestamp yang bisa ditelusuri.
3. Investigasi bisa disimpan, dilanjutkan, dan diekspor jadi laporan.
4. Collector modular, jadi sumber baru bisa ditambahkan tanpa mengubah inti sistem.
5. Discovery dibatasi scope dan depth supaya tidak berubah jadi scan liar.

### Di luar cakupan MVP

MVP tidak melakukan active scanning atau eksploitasi, tidak membeli atau memakai sumber data berbayar, dan belum mendukung kerja tim. Collector yang butuh melanggar ToS atau akses ilegal (misalnya breach database yang tidak sah) juga tidak akan dibuat. Platform hanya mengumpulkan informasi yang publik atau yang memang diizinkan.

### Metrik sukses

| Metrik | Target MVP |
| --- | --- |
| Waktu dari target ke graph pertama | < 60 detik untuk collector cepat (DNS, cert) |
| Entity ditemukan per investigasi domain | Median ≥ 15 node |
| Investigasi dengan bukti lengkap (semua node punya source) | 100% |
| Collector berjalan tanpa gagal | ≥ 95% job sukses |
| Reproduksibilitas (re-run target sama, graph konsisten) | ≥ 90% node sama |

## Persona dan use case

### Persona

| Persona | Konteks | Kebutuhan utama |
| --- | --- | --- |
| Analis threat intelligence | Memetakan infrastruktur yang dipakai aktor/kampanye | Pivot cepat domain → IP → ASN → cert, bukti tersimpan |
| Investigator / due diligence | Memverifikasi identitas organisasi atau orang (dengan dasar sah) | Korelasi entity, timeline, laporan rapi |
| Pentester (authorized) | Fase recon pada scope yang sudah diizinkan klien | Scope control ketat, subdomain & aset publik |
| Mahasiswa / peneliti keamanan | Belajar OSINT secara terstruktur | Alur jelas, provenance, aman untuk latihan |

### Use case yang boleh

1. Recon aset milik sendiri, atau milik klien yang sudah memberi izin tertulis (scope).
2. Riset threat intelligence terhadap infrastruktur publik milik aktor jahat.
3. Due diligence atau verifikasi organisasi dari sumber publik.
4. Belajar dan latihan OSINT pada target latihan atau milik sendiri.

### Use case yang dilarang

Platform tidak boleh dipakai untuk stalking atau melecehkan orang, doxxing, mengumpulkan data untuk menyakiti seseorang, mengakses data bocor atau curian, atau recon target tanpa izin di luar yang dibolehkan hukum. Desain produknya juga harus mempersulit pemakaian seperti itu. Saat pertama kali memakai, user wajib menyetujui *acceptable use policy*, dan setiap investigasi mencatat siapa yang menjalankannya (audit log).

> **Catatan untuk developer.** Data yang sama bisa dipakai untuk OSINT yang sah atau untuk penyalahgunaan. Yang membedakan biasanya izin dan tujuannya. Makanya scope, authorization prompt, acceptable use policy, dan audit log wajib ada. Keempatnya termasuk definisi produk ini.

## Konsep inti

Setiap investigasi melewati delapan tahap yang sama, dari target sampai laporan:

```
TARGET → DISCOVERY → COLLECTION → NORMALIZATION → CORRELATION → GRAPH → ANALYSIS → REPORT
```

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

Setiap pencarian disimpan dalam satu Investigation. Di dalamnya ada *targets* (bisa lebih dari satu), *entities* (hasil yang sudah dirapikan), *relationships* (hubungan antar-entity), *evidence* (bukti tiap hasil), *jobs* (pekerjaan collector), dan *reports*. Investigation bisa disimpan lalu dilanjutkan kapan saja, jadi hasilnya bisa diulang.

### Model entity dan relationship

Semua informasi disimpan dalam dua bentuk: entity (simpul) dan relationship (garis berarah antar-entity). Dengan model ini, hasil dari sumber yang berbeda bisa disambungkan.

Tipe entity: Person, Username, Email, Domain, Subdomain, IP, Organization, URL, Repository, Social Account, Certificate, ASN, Technology.

Tipe relationship: `OWNS`, `USES`, `REGISTERED_TO`, `RESOLVES_TO`, `HOSTED_ON`, `BELONGS_TO`, `AUTHORED`, `FOUND_ON`, `RELATED_TO`, `MENTIONS`, `LINKS_TO`, `HAS_SUBDOMAIN`.

## Kebutuhan fungsional

Setiap modul ditulis sebagai user story, lengkap dengan acceptance criteria (AC) yang bisa diuji.

### F1. One-click investigation

*Sebagai* analis, *saya ingin* memasukkan satu target lalu menekan satu tombol, *supaya* platform sendiri yang memilih dan menjalankan collector yang cocok.

- AC1: Tipe target (username/email/domain/IP/URL) terdeteksi otomatis. Kalau salah, user bisa mengoreksinya.
- AC2: Tombol "Investigate" membuat Investigation baru dan memasukkan job collector ke antrian sesuai tipe target.
- AC3: User bisa melihat status tiap collector secara real-time (queued → running → completed/failed).
- AC4: Entity baru yang ditemukan bisa dijadikan target berikutnya (pivot) dengan satu klik.

### F2. Intelligence graph

*Sebagai* analis, *saya ingin* melihat hasil dalam bentuk graph interaktif *supaya* hubungan antar-data gampang dipahami.

- AC1: Graph menampilkan node (entity) dan edge (relationship) yang berlabel.
- AC2: Bisa zoom, pan, expand, collapse, filter, cari node, isolate entity, dan mencari shortest path antara dua node.
- AC3: Klik node membuka panel detail berisi tipe, confidence, first seen, relationships, dan sumber/evidence.
- AC4: Node dengan confidence berbeda terlihat berbeda.

### F3. Evidence dan provenance

*Sebagai* investigator, *saya ingin* tahu asal setiap informasi *supaya* hasilnya bisa dipertanggungjawabkan.

- AC1: Setiap entity dan relationship menyimpan source, collector beserta versinya, timestamp (JST/UTC), dan record bukti (URL/response).
- AC2: Dari sebuah node, user bisa tahu "informasi ini dari mana?" dengan satu klik.
- AC3: Bukti tidak bisa diubah setelah dikumpulkan (append-only) dan ikut masuk ke laporan.

### F4. Confidence system

*Sebagai* analis, *saya ingin* tahu seberapa bisa dipercaya tiap informasi *supaya* bisa menentukan prioritas.

- AC1: Nilai confidence: HIGH / MEDIUM / LOW / UNKNOWN.
- AC2: Sumber terstruktur (misalnya GitHub API) bernilai HIGH, hasil pencarian MEDIUM, kemiripan username LOW.
- AC3: Confidence tampil di graph dan bisa dipakai untuk filter.

### F5. Search, timeline, evidence view

*Sebagai* analis, *saya ingin* mencari dan menelusuri investigasi dari waktu ke waktu.

- AC1: Global search mengelompokkan hasil per tipe (domain, IP, email, repo, people, relationship) dan menunjukkan jumlah tiap kelompok.
- AC2: Timeline menampilkan urutan kejadian dalam investigasi dan bisa difilter per entity, source, collector, tanggal, dan confidence.
- AC3: Evidence view tiap entity menampilkan tipe, confidence, first seen, relationships, dan daftar sumber.

### F6. Job system dan update real-time

*Sebagai* user, *saya ingin* collector jalan di belakang layar dan kabarnya langsung muncul.

- AC1: Status job: QUEUED / RUNNING / COMPLETED / FAILED / CANCELLED. Job bisa dibatalkan.
- AC2: Dashboard menerima update lewat WebSocket atau Server-Sent Events.
- AC3: Job yang gagal mencatat alasannya, dan investigasi tetap jalan.

### F7. Report export

*Sebagai* investigator, *saya ingin* mengekspor investigasi jadi laporan.

- AC1: Format ekspor: PDF, HTML, Markdown, JSON, CSV.
- AC2: Laporan berisi executive summary, target, entity yang ditemukan (domain, IP, akun, organisasi), relationships, timeline, evidence, dan sumber.
- AC3: Laporan mencantumkan tanggal, versi collector, dan siapa yang membuatnya.

### F8. Scope dan authorization control

*Sebagai* pemilik investigasi, *saya ingin* membatasi cakupannya *supaya* discovery tetap terarah dan sah.

- AC1: Setiap investigasi punya scope (domain yang diizinkan, termasuk wildcard) dan limit (`max_depth`, `max_entities`, `max_runtime`).
- AC2: Discovery berhenti begitu limit tercapai, dan user diberi tahu.
- AC3: Target di luar scope ditolak, atau baru diproses setelah user mengonfirmasi secara eksplisit.

### F9. Audit log

*Sebagai* admin, *saya ingin* semua tindakan penting tercatat.

- AC1: Log mencatat user, action, target, timestamp, dan result.
- AC2: Log bersifat append-only dan bisa ditinjau.

### F10. Autentikasi dan akun

*Sebagai* user, *saya ingin* akses yang aman.

- AC1: Password di-hash dengan Argon2id, sesi aman dan kedaluwarsa otomatis.
- AC2: 2FA opsional.
- AC3: User menyetujui acceptable use policy sebelum investigasi pertama.

## Collector framework

Setiap sumber data adalah *collector*, yaitu plugin dengan interface standar. Collector menerima input, memprosesnya, lalu mengembalikan *normalized result*.

Struktur folder yang disarankan: `collectors/{username,email,domain,dns,ip,github,social,search,certificate,organization}/`. Tiap collector mendeklarasikan tipe input yang diterima, entity/relationship yang dihasilkan, dan metadata (nama, versi, rate limit, confidence default).

Contoh hasil yang sudah dinormalisasi:

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

Collector lain (social, search umum, IP reputation lanjutan, phone) masuk roadmap. Masing-masing harus lolos review legal/ToS dulu sebelum ditambahkan.

### Discovery engine

Collector bisa jalan berantai. Entity baru dari satu collector bisa memicu collector berikutnya, misalnya `domain → subdomain → IP → ASN`. Supaya tidak jadi scan liar, discovery wajib dibatasi scope dan limit:

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

Limit ini mencegah discovery berjalan tanpa henti, mengurangi beban ke API sumber, menjaga investigasi tetap fokus, dan membantu memastikan platform hanya dipakai sesuai izin.

### Confidence system

Tingkat kepercayaan tiap informasi berbeda-beda, jadi masing-masing diberi nilai HIGH, MEDIUM, LOW, atau UNKNOWN. Default-nya begini: sumber terstruktur lewat API resmi (GitHub, RDAP, CT) dapat HIGH, metadata HTTP dan hasil pencarian dapat MEDIUM, dan sinyal tebakan seperti kemiripan username dapat LOW. Confidence disimpan per entity dan per relationship, tampil di graph, dan bisa dipakai untuk filter.

## UX dan layar utama

Tampilannya desktop-first, dengan sidebar navigasi dan satu area kerja utama. User tidak perlu tahu collector mana yang harus dijalankan. Cukup masukkan target, lalu baca graph-nya.

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

Menu sidebar: Dashboard · Investigations · Targets · Entities · Graph · Evidence · Reports · Collectors · Settings.

Alur yang paling umum: user membuka Dashboard, memasukkan target, lalu menekan "Investigate". Job mulai jalan dan statusnya terlihat langsung, misalnya DNS selesai, Certificate selesai, GitHub selesai, Username search masih jalan, Social discovery menunggu. Graph terisi sedikit demi sedikit. User mengklik node untuk melihat detail dan buktinya, melakukan pivot kalau perlu, lalu mengekspor laporan.

## Arsitektur, tech stack, data model, API

Frontend, API, penyimpanan, antrian job, dan worker collector dipisah. Worker menjalankan collector di sandbox/container terisolasi, jadi collector tidak punya akses penuh ke host. Diagram komponennya:

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

Tabel inti: `users`, `investigations`, `targets`, `entities`, `relationships`, `sources`, `evidence`, `jobs`, `collectors`, `reports`, `audit_logs`. Satu `entity` punya banyak `relationships` dan banyak `evidence`. Setiap `evidence` menunjuk ke satu `source`. Setiap `job` terikat ke satu `investigation` dan menghasilkan entity, relationship, dan evidence.

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

### REST API

API dirancang sebagai bagian utama sejak awal, supaya platform bisa dipakai lewat Web UI, CLI, SDK, maupun automation.

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

## Non-fungsional, keamanan, privasi, dan kepatuhan

### Kebutuhan non-fungsional

| Aspek | Target |
| --- | --- |
| Keandalan | Satu collector gagal tidak menggagalkan investigasi |
| Skalabilitas | Worker bisa ditambah horizontal mengikuti beban job |
| Observability | Log terstruktur, metrik job, jejak error per collector |
| Portabilitas | Seluruh stack berjalan via Docker Compose di satu VPS |
| Maintainability | Collector sebagai plugin dengan interface stabil |

### Keamanan

Untuk autentikasi, password di-hash dengan Argon2id, sesi aman dan punya masa berlaku, dan 2FA tersedia sebagai opsi.

Di sisi web, HTTPS wajib, ditambah HSTS, proteksi CSRF, CORS yang ketat, cookie aman, rate limiting, dan validasi semua input.

Collector jalan di sandbox/container tanpa akses penuh ke host, dengan timeout dan batas resource. Output collector dianggap data yang tidak bisa dipercaya, jadi divalidasi dulu sebelum masuk ke graph.

### Privasi dan kepatuhan hukum (wajib)

Platform ini bisa mengumpulkan data tentang orang sungguhan, jadi aturan berikut wajib dipenuhi:

1. UU PDP (Indonesia No. 27/2022). Kalau memproses data pribadi orang di Indonesia, harus ada dasar pemrosesan yang sah, data yang dikumpulkan seminimal mungkin, dan ada cara menghapus data. Tujuannya juga harus spesifik dan sah.
2. GDPR dan regulasi lain. Kalau subjek datanya ada di yurisdiksi lain, ikuti aturan setempat (hak akses, hak hapus, dasar hukum).
3. Terms of Service sumber. Collector hanya boleh memakai akses yang diizinkan ToS sumbernya, misalnya API resmi GitHub dengan token atau CT log publik. Scraping yang melanggar ToS atau menembus proteksi dilarang.
4. Acceptable Use Policy. Sebelum investigasi pertama, user harus setuju bahwa platform hanya dipakai untuk tujuan sah dan dengan izin yang diperlukan, dan tidak untuk stalking, doxxing, atau menyakiti orang.
5. Minimisasi data dan retensi. Simpan hanya yang perlu. Sediakan kebijakan retensi, dan cara menghapus investigasi beserta buktinya.
6. Audit dan atribusi. Semua tindakan penting dicatat secara append-only (user, action, target, timestamp, result).

> Rekomendasi: saat user mulai menginvestigasi orang atau organisasi, tampilkan *authorization prompt* yang meminta mereka menyatakan dasar hukumnya. Dengan begitu keputusan etisnya jadi langkah yang jelas dan tercatat.

## Roadmap, risiko, dan glosarium

### Definisi MVP

MVP tidak butuh ratusan collector. Yang wajib ada:

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

### Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Penyalahgunaan (stalking/doxxing) | Hukum & reputasi | AUP, authorization prompt, audit log, batasi collector |
| Pelanggaran ToS sumber | Akses diblokir, risiko hukum | Review ToS per collector, pakai API resmi, hormati rate |
| Runaway discovery | Beban API, biaya, noise | Scope + max\_depth/entities/runtime wajib |
| Kualitas data rendah | Hasil menyesatkan | Confidence system, provenance, validasi output |
| Collector berbahaya | Kompromi host | Sandbox/container, batas resource, output tak tepercaya |

### Pertanyaan terbuka

1. Sumber mana saja yang ToS-nya membolehkan pemakaian otomatis di skala MVP?
2. Berapa lama investigasi dan bukti disimpan secara default?
3. Untuk target "person", apakah authorization prompt sudah cukup, atau perlu verifikasi dasar hukum yang lebih kuat?
4. Berapa batas rate dan kuota per user supaya tidak disalahgunakan?

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
