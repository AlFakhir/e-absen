
# 📱 E-Absensi Pintar - Sistem Absensi Sekolah Modern

Aplikasi absensi siswa berbasis QR Code yang terintegrasi dengan notifikasi WhatsApp otomatis ke orang tua.

## 🛠️ Teknologi yang Digunakan

### **Frontend**
- **React + Vite**: Framework JavaScript modern untuk performa tinggi.
- **Tailwind CSS**: Framework CSS utility-first untuk desain yang bersih dan responsif.
- **Responsive Design**: Optimal untuk penggunaan di Smartphone (Android/iOS) maupun Laptop/PC.

### **Backend**
- **Node.js + Express**: Server-side runtime dan framework untuk menangani API dan logika bisnis.

### **Database Realtime**
- **Firebase Firestore**: Database NoSQL cloud untuk penyimpanan data secara realtime dan sinkronisasi antar perangkat.

### **Notifikasi WhatsApp**
- **Fonnte API**: Gateway pengiriman pesan WhatsApp otomatis ke nomor orang tua siswa saat absensi dilakukan.

### **Hosting & Deployment**
- **Vercel**: Platform hosting untuk bagian Frontend (React).
- **Render**: Platform hosting untuk bagian Backend (Node.js/Express).

---

## 📱 Panduan Build Aplikasi Android (APK)

Aplikasi ini telah dikonfigurasi menggunakan **Capacitor** agar dapat dijalankan sebagai aplikasi Android asli.

## Prasyarat
1. Install [Node.js](https://nodejs.org/)
2. Install [Android Studio](https://developer.android.com/studio)
3. Siapkan Device Android atau Emulator.

## Langkah-langkah Membuat APK

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Versi Web**
   Langkah ini akan menghasilkan folder `dist`.
   ```bash
   npm run build
   ```

3. **Inisialisasi Platform Android**
   (Hanya dilakukan sekali)
   ```bash
   npx cap add android
   ```

4. **Sinkronisasi Kode ke Android**
   Setiap kali Anda merubah kode di React, jalankan ini:
   ```bash
   npm run build
   npm run android-sync
   ```

5. **Membuka Proyek di Android Studio**
   ```bash
   npm run android-open
   ```

6. **Generate APK di Android Studio**
   - Setelah Android Studio terbuka, tunggu proses Gradle selesai.
   - Pergi ke menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Tunggu hingga muncul notifikasi "APK generated successfully".
   - Klik **Locate** untuk mengambil file `app-debug.apk`.

## Izin Kamera
Aplikasi ini membutuhkan izin kamera untuk fitur Scan QR. Capacitor akan otomatis meminta izin ini saat aplikasi dijalankan pertama kali. Pastikan di file `AndroidManifest.xml` (dalam folder android) sudah terdapat:
`<uses-permission android:name="android.permission.CAMERA" />`

---
© 2024 E-Absensi Pintar - Versi Android Ready
