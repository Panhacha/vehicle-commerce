# Vehicle E-commerce & Multi-Branch Management System
## ប្រព័ន្ធពាណិជ្ជកម្មអេឡិចត្រូនិកយានយន្ត និងគ្រប់គ្រងច្រើនសាខា

---

## 🚀 Overview & Vision (ទស្សនវិស័យទូទៅ)
ប្រព័ន្ធពាណិជ្ជកម្មអេឡិចត្រូនិកទំនើប និងប្រព័ន្ធគ្រប់គ្រងសាខា (Multi-Branch ERP & E-Commerce) សម្រាប់លក់រថយន្ត ម៉ូតូ កង់ (Gasoline & Electric Vehicles) និងគ្រឿងបន្លាស់ ដែលគាំទ្រការលក់បង់ផ្ដាច់ (Full Payment), បង់រំលោះ (Installment Loan), ប្ដូរយានយន្តចាស់យកថ្មី (Trade-in), និងការទិញចូល-លក់ចេញ (Buy & Resell)។

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Lucide Icons, Glassmorphism UI |
| **Backend** | Go (Golang 1.24+), Gin Web Framework, JWT RBAC, pq (PostgreSQL Driver) |
| **Database** | **Supabase (Cloud PostgreSQL)** - No Docker required! |
| **Notifications** | Telegram Bot API (Instant Alerts for Orders, Trade-In, Loans & Low Stock) |

---

## ☁️ ការរៀបចំ Supabase Database (Supabase Setup Guide)

គម្រោងនេះប្រើប្រាស់ **Supabase** ជា Cloud Database ដោយមិនចាំបាច់ប្រើប្រាស់ Docker ទៀតឡើយ៖

### ជំហានទី ១៖ បង្កើត Project និងរៀបចំ Schema លើ Supabase
1. ចូលទៅកាន់ [https://supabase.com](https://supabase.com) រួចបង្កើតគណនី ឬ **New Project**។
2. ក្នុង Project Dashboard ជ្រើសរើស menu **SQL Editor** នៅខាងឆ្វេង -> ចុច **New query**។
3. បើក file `backend/migrations/supabase_setup.sql` រួច Copy កូដ SQL ទាំងអស់ យកទៅ Paste ក្នុង SQL Editor ហើយចុច **Run**។
   *(វានឹងបង្កើត Table ទាំងអស់ និងបញ្ចូលទិន្នន័យគំរូរួមមាន រថយន្ត Toyota 2026-2027 ចំនួន ២៧ ម៉ូឌែល, សាខា, និង User គ្រប់គ្រងដោយស្វ័យប្រវត្តិ)*
   បន្ទាប់ពី setup នេះដំណើរការជោគជ័យ Backend នឹងរំលង schema និង seed migrations មូលដ្ឋាន ហើយអនុវត្តតែ migrations បន្ថែមសម្រាប់ Admin ERP។

### ជំហានទី ២៖ កំណត់ Connection String ក្នុង `.env`
1. ក្នុង Supabase Dashboard ចូលទៅកាន់ **Project Settings** > **Database** > ផ្នែក **Connection string** > ជ្រើសយក tab **URI**។
2. Copy URI នោះហើយយកទៅដាក់ក្នុង file `backend/.env`៖
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```
*(សូមប្តូរ `[YOUR-PASSWORD]` ទៅជា password ដែលអ្នកបានកំណត់ពេលបង្កើត project នៅ supabase)*

កំណត់ `JWT_SECRET` ក្នុង `backend/.env` ជាខ្សែអក្សរសម្ងាត់ចៃដន្យយ៉ាងតិច ៣២ តួអក្សរ។ Backend នឹងមិនចាប់ផ្ដើមទេ ប្រសិនបើអថេរនេះមិនមាន។

---

## ⚡ One-Command Startup (បញ្ជាតែមួយដំណើរការប្រព័ន្ធទាំងមូល)

ដោយសារតែ Database ស្ថិតនៅលើ Cloud (Supabase) លោកអ្នកពុំបាច់បើក Docker ឡើយ! គ្រាន់តែ run command មួយគត់៖

### វិធីទី ១៖ ប្រើ Batch File (ងាយស្រួលបំផុត - Double-Click ឬ Terminal)
```cmd
.\start.bat
```
> ឬគ្រាន់តែ **Double-Click លើ file start.bat** នៅក្នុង Folder D:\Project\vehicle-commerce។

### វិធីទី ២៖ ប្រើ PowerShell
```powershell
.\start.ps1
```

### វិធីទី ៣៖ ប្រើ npm
```bash
npm start
```

### 🛑 របៀបបិទ Services ទាំងអស់វិញ (One-Command Stop)
```cmd
.\stop.bat
# ឬ
.\stop.ps1
```

---

## 🏁 Manual Start (ប្រសិនបើចង់ run ម្ដងមួយៗ)

### 1. Run Backend Locally (Port 8080)
```powershell
cd D:\Project\vehicle-commerce\backend
go run ./cmd/api
```
Backend API ដំណើរការនៅ: `http://localhost:8080/api/v1`

### 2. Run Frontend (Port 3000)
```powershell
cd D:\Project\vehicle-commerce\frontend
npm run dev
```
បើក Browser នៅ: `http://localhost:3000`

- User storefront: `http://localhost:3000/`
- Admin dashboard: `http://localhost:3000/admin`

ចូល Admin ដោយប្រើគណនីដែលមានតួនាទី `SUPER_ADMIN`, `BRANCH_ADMIN`, ឬ `STAFF`។ គណនីសាកល្បងនៅក្នុង seed data ប្រើ password `admin123`; សូមប្តូរវាមុនប្រើប្រាស់ពិត។

---

## 🔑 Default Accounts (គណនីសាកល្បង)

| តួនាទី (Role) | Username | Password | សិទ្ធិ និងការងារ |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `admin123` | គ្រប់គ្រងសាខាទាំងអស់, របាយការណ៍រួម |
| **Branch Manager** | `pp_manager` | `admin123` | គ្រប់គ្រងសាខាភ្នំពេញ, ស្តុក, បុគ្គលិក |
| **Staff Sales** | `staff_dara` | `admin123` | បង្កើត Order, ពិនិត្យ Trade-in & Loan |
| **Customer** | `customer_visal` | `admin123` | មើលទំនិញ, កក់រថយន្ត, ស្នើបង់រំលោះ |

---

## 🤖 Telegram Bot Configuration
1. បង្កើត Bot តាមរយៈ `@BotFather` នៅលើ Telegram ដើម្បីទទួលបាន `TELEGRAM_BOT_TOKEN`។
2. បង្កើត Telegram Group សម្រាប់បុគ្គលិក និងបន្ថែម Bot ចូល រួចយក `Chat ID` មកដាក់ក្នុង `.env`:
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_ALERT_CHAT_ID=-1001234567890
```
3. រាល់ពេលមានការកុម្ម៉ង់ថ្មី (New Order), សំណើ Trade-in, ឬស្តុកជិតអស់ ប្រព័ន្ធនឹងផ្ញើសារជូនដំណឹងភ្លាមៗ!
