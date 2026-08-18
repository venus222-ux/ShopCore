# ShopCore — Laravel + React (Docker)

Aplicație full-stack rulată complet în Docker.

### Stack

- **Backend:** Laravel 12 + FrankenPHP with JWT Auth, HttpOnly Cookie, Spatie Roles
- **Frontend:** React + Vite
- **Baze de date:** MySQL 8, MongoDB 7, Redis 7
- **Altele:** Elasticsearch, Soketi (WebSockets), Horizon, Prometheus, Grafana, phpMyAdmin
- Stripe (procesare plăți card)
- Spatie MediaLibrary (imagini produse, facturi PDF, credit notes)
- DomPDF (generare facturi/credit notes)

app/Services/
├── Checkout/
│ ├── CheckoutService.php orchestrator principal
│ ├── AddressResolver.php
│ ├── CartResolver.php
│ ├── CouponApplier.php
│ ├── ShippingCostResolver.php
│ └── OrderFactory.php
├── Payment/
│ ├── PaymentHandlerResolver.php strategy pattern
│ ├── StripePaymentHandler.php
│ └── CashPaymentHandler.php
├── InventoryService.php reserve / finalize / release / restock
├── OrderPaymentService.php markPaid() - sursă unică pentru "comandă plătită"
├── RefundService.php card + cash, cu Stripe ca sursă de adevăr
└── StripeService.php creare sesiune Checkout

## Modele principale

| Model                        | Rol                                                                   |
| ---------------------------- | --------------------------------------------------------------------- |
| `Order`                      | Comandă — pricing, status, snapshot adresă, metodă de plată           |
| `OrderItem`                  | Linie de comandă (produs + variantă + cantitate + preț)               |
| `Product` / `ProductVariant` | Catalog, cu variante pe atribute (culoare, mărime)                    |
| `Inventory`                  | Stoc per variantă — `quantity` (real) vs `reserved` (blocat temporar) |
| `Refund`                     | Rambursare — directă (admin) sau cerere (client → aprobare admin)     |
| `Coupon`                     | Cod de discount, cu limită de utilizare și interval de valabilitate   |
| `Address`                    | Carte de adrese, cu snapshot copiat pe comandă la checkout            |
| `Setting`                    | Configurări globale (feature flags: cupoane, COD)                     |

## Fluxul de comandă, pe scurt

````
Checkout (card SAU cash)
    → rezervare stoc (reserved += qty)
    → creare Order (status: pending)
    → [card] redirect Stripe  ⎪  [cash] confirmare directă, fără redirect
        ↓                            ↓
    webhook Stripe confirmă    admin confirmă manual cash primit
        ↓                            ↓
    OrderPaymentService::markPaid()  (ACEEAȘI cale pentru ambele)
        → status: paid
        → email confirmare
        → finalize() stoc (quantity -= qty, reserved -= qty)




## Note pentru producție

- **Scheduler**: cron trebuie configurat pe server (`* * * * * php artisan schedule:run`) — fără el, comenzile de curățare a stocului nu rulează niciodată automat.
- **Horizon**: verifică `config/horizon.php` — fiecare coadă folosită în cod (`default`, `emails`, `inventory`) trebuie să aibă un supervisor configurat, altfel joburile rămân blocate silențios.
- **Rate limiting**: acțiunile de admin (complete/confirm-cash/release/restock) pot atinge limita implicită de throttle la testare rapidă repetată — frontend-ul are gărzi sincrone împotriva dublu-click, dar limita de server rămâne activă.

## Documentație detaliată

Vezi **HELP.md** pentru:
- Fluxul complet de plată (user + admin), pas cu pas
- Sistemul de refund (card vs. cash)
- Gestionarea cupoanelor
- Gestionarea stocului și cazurile speciale
- Comenzi Artisan de întreținere
- Troubleshooting pentru problemele reale întâlnite în dezvoltare
---

## 🚀 Pornire rapidă

```bash
# 1. Pornește totul
docker compose up -d --build

# 2. Backend setup
cp backend/.env.example backend/.env
docker compose exec laravel_app composer install
docker compose exec laravel_app php artisan key:generate
docker compose exec laravel_app php artisan jwt:secret
docker compose exec laravel_app php artisan migrate --seed

# 3. Frontend setup
cp frontend/.env.example frontend/.env
docker compose exec frontend npm install
docker compose up -d --force-recreate frontend
docker compose exec frontend npm install laravel-echo pusher-js
````

Apoi deschide:

- Frontend → http://localhost:5173
- API → http://localhost:8000
- phpMyAdmin → http://localhost:8081
- Grafana → http://localhost:3000 (user: `admin`)

---

## 🌐 URL-uri importante

| Serviciu       | URL                   |
| -------------- | --------------------- |
| React (Vite)   | http://localhost:5173 |
| Laravel API    | http://localhost:8000 |
| phpMyAdmin     | http://localhost:8081 |
| Grafana        | http://localhost:3000 |
| Prometheus     | http://localhost:9090 |
| Elasticsearch  | http://localhost:9200 |
| Soketi (WS)    | http://localhost:6001 |
| MySQL (host)   | localhost:3307        |
| MongoDB (host) | localhost:27018       |
| Redis (host)   | localhost:6380        |

---

## ⚙️ Configurație .env (important!)

### Backend (`backend/.env`)

```dotenv
DB_HOST=mysql
DB_PORT=3306
REDIS_HOST=redis
STRIPE_KEY / STRIPE_SECRET / STRIPE_WEBHOOK_SECRET (config/services.php)
DB_MONGO_HOST=mongodb
ELASTICSEARCH_HOST=elasticsearch
PUSHER_HOST=soketi          # ← din interiorul Docker
PUSHER_PORT=6001
```

### Frontend (`frontend/.env`)

```dotenv
VITE_API_URL=http://localhost:8000
VITE_PUSHER_HOST=localhost  # ← din browser
VITE_PUSHER_PORT=6001
```

> **Regulă simplă:**
>
> - Din **containere** → folosești numele serviciului (`mysql`, `redis`, `soketi`...)
> - Din **browser** → folosești `localhost` + portul publicat

---

## 🛠️ Comenzi utile

```bash
# Status
docker compose ps

# Loguri
docker compose logs -f
docker compose logs -f laravel_app
docker compose logs -f laravel_worker

# Restart
docker compose restart laravel_app
docker compose restart laravel_worker

# Oprește tot
docker compose down

# Oprește + șterge volume (atenție: șterge datele!)
docker compose down -v
```

### Laravel

```bash
docker compose exec laravel_app bash
docker compose exec laravel_app php artisan migrate
docker compose exec laravel_app php artisan optimize:clear
docker compose exec laravel_app php artisan horizon:status
docker compose exec laravel_app php artisan schedule:work
docker compose restart prometheus
```

### Frontend

```bash
docker compose exec frontend npm install
docker compose exec frontend npm run build
```

---

## 📋 Servicii Docker

| Service          | Port host | Rol              |
| ---------------- | --------- | ---------------- |
| `laravel_app`    | 8000      | API + FrankenPHP |
| `laravel_worker` | —         | Horizon (queues) |
| `frontend`       | 5173      | React + Vite     |
| `mysql`          | 3307      | MySQL            |
| `mongodb`        | 27018     | MongoDB          |
| `redis`          | 6380      | Cache + Queue    |
| `elasticsearch`  | 9200      | Search           |
| `soketi`         | 6001      | WebSockets       |
| `prometheus`     | 9090      | Metrics          |
| `grafana`        | 3000      | Dashboards       |
| `phpmyadmin`     | 8081      | Admin MySQL      |

---

## 🔑 Credențiale

**MySQL / phpMyAdmin**

- Database: `shopcore`
- User: `shopcore`
- Password: `secret`

**Soketi / Pusher**

- App ID: `shopcore`
- Key: `shopcore_key`
- Secret: `shopcore_secret`

**Grafana**

- User: `admin`

```
**Ngrok**
https://dashboard.ngrok.com/`

Pornește tunelul
În alt terminal CMD:
ngrok http 8000

**Stripe**
https://dashboard.stripe.com/
```
**Elasticsearch command**
php artisan elasticsearch:setup    # șterge + recreează indexul cu mapping-ul corect
php artisan products:reindex       # abia acum populează cu date


Testare:
php artisan orders:release-stale-reservations --hours=24
php artisan orders:release-stale-cash --days=14