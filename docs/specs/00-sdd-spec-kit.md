# Spec-Driven Development (SDD) & Spec Kit

## 1. Pendahuluan
Dokumen ini merupakan bagian dari Spec Kit untuk framework pengembangan aplikasi Dashboard Monitoring Hibah Dryer. Dengan Spec-Driven Development (SDD), setiap fitur yang akan dikembangkan harus didefinisikan secara deklaratif terlebih dahulu di dalam direktori `docs/specs/` sebelum diimplementasikan ke dalam kode.

## 2. Struktur Spec Kit
Setiap spesifikasi (Spec) harus memuat:
- **Tujuan Singkat**: Apa objektif dari fitur bersangkutan.
- **Model Context**: Struktur data dan konteks (berkaitan erat dengan struktur Model Context Protocol).
- **Alur Kerja (Workflow)**: Interaksi dari user atau Agent AI.

## 3. Integrasi MCP (Model Context Protocol) & AI Agent
Sistem akan menggunakan MCP untuk melakukan penyesuaian agent respons ketika ada interaksi asinkron (misalnya notifikasi gateway satelit atau IoT telemetry dari mesin dryer). 

**AI Agent Capabilities:**
1. Mampu membaca current state dari IoT Dryer (aktif/idle/maintenance).
2. Mengeksekusi context fetching melalui MCP Server lokal untuk memperkaya prompt dengan data cuaca atau harga komoditas (misal harga jagung saat ini).

*Spesifikasi lengkap untuk masing-masing modul silakan tambahkan sebagai file terpisah dalam direktori ini.*
