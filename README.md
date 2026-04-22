# Home Food Marketplace

Home Food Marketplace is a food marketplace web application for CptS 489 (Web Development) at Washington State University. Customers can browse local homemade food listings and place orders, while cooks (merchants) manage restaurants, menus, and order fulfillment.

## Course Info
- Course: CptS 489 - Spring 2026
- Institution: Washington State University

## Contributors
- Yaru Gao

## GitHub Repo
https://github.com/YaruG1022/CptS489.git

## Tech Stack
- Backend: Node.js + Express
- Templating: EJS
- ORM: Sequelize
- Database: MySQL
- Language: JavaScript

## Project Structure
- Application root: `HFM/`
- Server entry point: `HFM/bin/www`
- Main app config: `HFM/app.js`

## Prerequisites
- Node.js 18+ (or newer LTS)
- npm 9+
- MySQL 8+ (or compatible MySQL server)

## 0) (Optional) Create MySQL Docker Container

If you do not have a local MySQL server, create one with Docker:

```powershell
docker run --name mysql-hfm -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -e MYSQL_DATABASE=homeplate -p 3306:3306 -d mysql:8
```

Check container status:

```powershell
docker ps
```

If container already exists but is stopped:

```powershell
docker start mysql-hfm
```

## 1) Install Dependencies

From repository root:

```bash
cd HFM
npm install
```

## 2) Configure Environment Variables

The app reads database settings from environment variables in `HFM/db.js`.

Required/Supported variables:

- `DB_NAME` (default: `homeplate`)
- `DB_USER` (default: `root`)
- `DB_PASS` (default: empty string)
- `DB_HOST` (default: `127.0.0.1`)
- `DB_PORT` (default: `3306`)
- `SESSION_SECRET` (recommended; default exists for local dev only)

Windows PowerShell example:

```powershell
$env:DB_NAME="homeplate"
$env:DB_USER="root"
$env:DB_PASS="your_password"
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="3306"
$env:SESSION_SECRET="replace_with_a_strong_secret"
```

For the provided Docker container `mysql-hfm`, use an empty DB password:

```powershell
$env:DB_PASS=""
```

macOS/Linux example:

```bash
export DB_NAME=homeplate
export DB_USER=root
export DB_PASS=your_password
export DB_HOST=127.0.0.1
export DB_PORT=3306
export SESSION_SECRET=replace_with_a_strong_secret
```

## 3) Database Setup and Restore

Dump file info (for submission/review):
- File: `documentation/homeplate_dump.sql`
- Source DB: `homeplate` (MySQL 8 in Docker container `mysql-hfm`)
- Generated: 2026-04-21

### Option A: Restore from SQL dump

Create database:

```sql
CREATE DATABASE homeplate;
```

Restore dump (example):

```bash
mysql -u root -p homeplate < documentation/homeplate_dump.sql
```

If you are using Docker MySQL (same setup as this project), you can restore with:

```powershell
Get-Content documentation/homeplate_dump.sql | docker exec -i mysql-hfm mysql -uroot homeplate
```

### Option B (Local development only): Auto-sync schema

If no dump is restored, the app runs `sequelize.sync({ alter: true })` on startup and creates/updates tables automatically. This is convenient for local development but dump restore is preferred for reproducible grading.

## 4) Run the Application

From `HFM/`:

```bash
npm start
```

If successful, server runs at:

- `http://localhost:3000`

## Quick Start (Docker + PowerShell)

Use this shortest command flow for the Docker MySQL setup in this repository:

```powershell
docker start mysql-hfm
cd HFM
npm install
$env:DB_NAME="homeplate"
$env:DB_USER="root"
$env:DB_PASS=""
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="3306"
$env:SESSION_SECRET="replace_with_a_strong_secret"
cd ..
Get-Content documentation/homeplate_dump.sql | docker exec -i mysql-hfm mysql -uroot homeplate
cd HFM
npm start
```

## 5) Core User Roles and Flows
- Customer:
	- Register/login
	- Browse restaurants and filter by tags
	- Add items to cart and checkout
	- View current order + order history
- Cook (Merchant):
	- Register/login as cook
	- Create/select/delete restaurants
	- Manage menu items and inventory
	- View current/completed orders

## Useful Scripts
- `npm start`: start the Express server (`node ./bin/www`)

## Troubleshooting
- Port conflict (`Port 3000 is already in use`): stop existing process using port 3000, then restart.
- DB connection failure: verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, and that MySQL is running.
- Login/session issues: set a non-empty `SESSION_SECRET` in your environment.
