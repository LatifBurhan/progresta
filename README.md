# Next.js Dashboard Template

Template sederhana untuk aplikasi dengan authentication (login/register) dan dashboard yang sudah terintegrasi dengan Supabase menggunakan Prisma ORM.

## Features

- ✅ Authentication (Login & Register)
- ✅ Role-based access (ADMIN & USER)
- ✅ Protected dashboard routes
- ✅ Session management dengan JWT
- ✅ User profile management dengan foto profil
- ✅ Supabase PostgreSQL integration
- ✅ Supabase Storage untuk upload foto
- ✅ Prisma ORM
- ✅ Tailwind CSS + shadcn/ui components

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Prisma 6** - Database ORM
- **Supabase** - PostgreSQL database
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **bcryptjs** - Password hashing
- **jose** - JWT session management
- **Zod** - Schema validation

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd <your-project>
npm install
```

### 2. Setup Supabase

Buat project baru di [Supabase](https://supabase.com):

1. Buka Supabase Dashboard
2. Create new project
3. Tunggu database ready
4. Buka **Project Settings** > **Database**
5. Copy **Connection String** (pilih mode: Session untuk DATABASE_URL dan Transaction untuk DIRECT_URL)
6. Buka **Project Settings** > **API**
7. Copy **Project URL** dan **anon public key**
8. Copy **service_role key** (untuk upload foto)

### 3. Setup Environment Variables

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` dan isi dengan credentials Supabase Anda:

```env
# Database (dari Supabase Project Settings > Database)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&prepared_statements=false&connection_limit=5&pool_timeout=10"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase (dari Supabase Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# App Configuration
NODE_ENV="development"
SESSION_SECRET="your-super-secret-key-min-32-characters"
REGISTRATION_TOKEN="your-registration-token"
```

**Generate SESSION_SECRET:**
```bash
openssl rand -base64 32
```

**Generate REGISTRATION_TOKEN:**
```bash
openssl rand -hex 16
```

### 4. Setup Database & Storage

**Push Database Schema:**
```bash
# Generate Prisma Client
bunx prisma generate

# Push schema ke database
bunx prisma db push
```

**Setup Supabase Storage:**
1. Buka Supabase Dashboard > Storage
2. Create new bucket dengan nama `profile-photos`
3. Set bucket sebagai **Public**
4. Konfigurasi RLS policies untuk bucket (lihat [docs/SUPABASE_STORAGE_SETUP.md](./docs/SUPABASE_STORAGE_SETUP.md))

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Cara Pemakaian

### 1. Registrasi User Pertama (Admin)

Untuk membuat admin pertama, gunakan registration token:

1. Buka http://localhost:3000/[REGISTRATION_TOKEN]/register
   - Ganti `[REGISTRATION_TOKEN]` dengan token dari `.env`
   - Contoh: http://localhost:3000/abc123def456/register
2. Isi email dan password
3. Role otomatis akan menjadi ADMIN
4. Klik Register
5. Redirect ke login page

### 2. Login

1. Buka http://localhost:3000/login
2. Isi email dan password yang sudah didaftarkan
3. Klik Login
4. Redirect ke dashboard

### 3. Dashboard

Setelah login, Anda akan masuk ke dashboard:
- **Dashboard Home** (`/dashboard`) - Menampilkan informasi user
- **Profile** (`/dashboard/profile`) - Kelola profile dan upload foto profil
- **Users** (`/dashboard/users`) - Kelola users (khusus ADMIN)

### 4. Kelola Profile

1. Dari dashboard, klik menu **Profile**
2. Upload foto profil dengan klik area upload atau drag & drop
3. Foto akan otomatis tersimpan di Supabase Storage
4. Foto profil akan muncul di navbar

### 5. Kelola Users (Admin Only)

1. Dari dashboard, klik menu **Users**
2. Lihat daftar semua users
3. Tambah user baru dengan klik tombol **Create User**
4. Edit atau hapus user yang ada
5. User baru akan mendapat email notifikasi (jika email service dikonfigurasi)

### 6. Logout

Klik tombol **Logout** di navbar untuk keluar dari aplikasi.

## Project Structure

```
├── app/
│   ├── (auth)/              # Auth pages (login, register)
│   │   ├── login/
│   │   ├── register/
│   │   └── [token]/register/  # Token-based registration
│   ├── actions/             # Server actions
│   │   └── auth-actions.ts  # Login, register, logout
│   ├── api/                 # API routes
│   │   ├── auth/            # Auth endpoints
│   │   ├── profile/         # Profile & upload endpoints
│   │   └── users/           # User management endpoints
│   ├── dashboard/           # Protected dashboard
│   │   ├── layout.tsx       # Dashboard layout with navbar
│   │   ├── page.tsx         # Dashboard home
│   │   ├── profile/         # Profile management
│   │   └── users/           # User management (admin only)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Landing page
├── components/
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── prisma.ts            # Prisma client
│   ├── session.ts           # Session management
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Utility functions
├── prisma/
│   └── schema.prisma        # Database schema
└── .env.example             # Environment variables template
```

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   Profile?
}

model Profile {
  id         String   @id @default(uuid())
  userId     String   @unique
  fotoProfil String?  // URL foto di Supabase Storage
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Role {
  ADMIN
  USER
}
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio (GUI untuk database)
```

## Customization

### Tambah Field di Profile

Edit `prisma/schema.prisma`:

```prisma
model Profile {
  id         String   @id @default(uuid())
  userId     String   @unique
  fotoProfil String?
  nama       String?  // Tambah field baru
  telepon    String?  // Tambah field baru
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Lalu jalankan:
```bash
bunx prisma db push
```

### Tambah Model Baru

Edit `prisma/schema.prisma` dan tambahkan model baru:

```prisma
model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

Jangan lupa tambahkan relasi di model User:
```prisma
model User {
  // ... fields lainnya
  posts     Post[]
}
```

Lalu jalankan:
```bash
bunx prisma db push
```

### Ubah Styling

Edit `app/globals.css` untuk global styles atau edit component files langsung. Template ini menggunakan Tailwind CSS dan CSS variables untuk theming.

### Tambah UI Components

Gunakan shadcn/ui CLI untuk menambah components:
```bash
npx shadcn-ui@latest add [component-name]
```

Contoh:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
```

## Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Set environment variables di Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
   - `REGISTRATION_TOKEN`
   - `NODE_ENV=production`
4. Deploy

### Platform Lain (Railway, Render, dll)

1. Set semua environment variables
2. Build command: `npm run build`
3. Start command: `npm start`
4. Pastikan Node.js version minimal 18.x

### Catatan Deployment

- Pastikan Supabase project sudah production-ready
- Jangan lupa setup Supabase Storage bucket `profile-photos`
- Test semua fitur setelah deployment
- Monitor logs untuk error

## Troubleshooting

### Database Connection Error

- Pastikan `DATABASE_URL` dan `DIRECT_URL` benar
- Cek Supabase project masih aktif
- Cek password tidak ada karakter special yang perlu di-encode
- Pastikan connection string menggunakan parameter yang benar

### Prisma Client Error

Regenerate Prisma Client:
```bash
bunx prisma generate
```

### Session Error

- Pastikan `SESSION_SECRET` sudah diset di `.env`
- Minimal 32 karakter
- Generate ulang jika perlu: `openssl rand -base64 32`

### Upload Foto Error

- Pastikan bucket `profile-photos` sudah dibuat di Supabase Storage
- Pastikan bucket di-set sebagai Public
- Cek `SUPABASE_SERVICE_ROLE_KEY` sudah benar
- Cek RLS policies sudah dikonfigurasi dengan benar

### Registration Token Error

- Pastikan `REGISTRATION_TOKEN` sudah diset di `.env`
- URL registrasi harus: `http://localhost:3000/[TOKEN]/register`
- Token harus match dengan yang di `.env`

## Dokumentasi Lengkap

**Setup & Configuration:**
- [docs/QUICK_SETUP.md](./docs/QUICK_SETUP.md) - Quick setup guide
- [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md) - Getting started
- [docs/SETUP.md](./docs/SETUP.md) - Detailed setup
- [docs/ADMIN_SETUP.md](./docs/ADMIN_SETUP.md) - Admin setup guide
- [docs/REGISTRATION_SECURITY.md](./docs/REGISTRATION_SECURITY.md) - Registration security
- [docs/SUPABASE_STORAGE_SETUP.md](./docs/SUPABASE_STORAGE_SETUP.md) - Storage setup

**Feature Guides:**
- [docs/USER_MANAGEMENT_GUIDE.md](./docs/USER_MANAGEMENT_GUIDE.md) - User management
- [docs/PHOTO_UPLOAD_GUIDE.md](./docs/PHOTO_UPLOAD_GUIDE.md) - Photo upload guide
- [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) - Project structure
- [docs/DATABASE_BEST_PRACTICES.md](./docs/DATABASE_BEST_PRACTICES.md) - Database best practices
- [docs/FAQ.md](./docs/FAQ.md) - Frequently asked questions
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Troubleshooting guide

## License

MIT

## Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.
