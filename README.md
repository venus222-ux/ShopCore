# ShopCore — Platformă E-commerce

Marketplace full-stack cu backend Laravel (PHP) și frontend React/TypeScript, susținând produse digitale, fizice și servicii, cu plată prin card (Stripe) și numerar la livrare (Cash on Delivery).

## Stack tehnic

**Backend**
- Laravel (PHP) + MySQL
- Redis (queue, cache) + Laravel Horizon (monitorizare cozi)
- MongoDB (loguri de upload)
- Elasticsearch (căutare full-text + faceting pe atribute)
- Stripe (procesare plăți card)
- Spatie MediaLibrary (imagini produse, facturi PDF, credit notes)
- DomPDF (generare facturi/credit notes)

**Frontend**
- React + TypeScript
- Zustand (state management)
- React Query (data fetching pentru unele hook-uri)
- Bootstrap + CSS Modules

## Arhitectura de bază

```
routes/api.php
    ├── public/                    (produse, căutare, categorii, wishlist)
    ├── jwt.auth/                  (checkout, comenzi proprii, adrese, refund-uri proprii)
    └── admin (jwt.auth + role:admin)/  (CRUD produse, comenzi, refund-uri, cupoane, setări)

app/Services/
    ├── Checkout/
    │   ├── CheckoutService.php         orchestrator principal
    │   ├── AddressResolver.php
    │   ├── CartResolver.php
    │   ├── CouponApplier.php
    │   ├── ShippingCostResolver.php
    │   └── OrderFactory.php
    ├── Payment/
    │   ├── PaymentHandlerResolver.php  strategy pattern
    │   ├── StripePaymentHandler.php
    │   └── CashPaymentHandler.php
    ├── InventoryService.php            reserve / finalize / release / restock
    ├── OrderPaymentService.php         markPaid() - sursă unică pentru "comandă plătită"
    ├── RefundService.php               card + cash, cu Stripe ca sursă de adevăr
    └── StripeService.php               creare sesiune Checkout
```

## Modele principale

| Model | Rol |
|---|---|
| `Order` | Comandă — pricing, status, snapshot adresă, metodă de plată |
| `OrderItem` | Linie de comandă (produs + variantă + cantitate + preț) |
| `Product` / `ProductVariant` | Catalog, cu variante pe atribute (culoare, mărime) |
| `Inventory` | Stoc per variantă — `quantity` (real) vs `reserved` (blocat temporar) |
| `Refund` | Rambursare — directă (admin) sau cerere (client → aprobare admin) |
| `Coupon` | Cod de discount, cu limită de utilizare și interval de valabilitate |
| `Address` | Carte de adrese, cu snapshot copiat pe comandă la checkout |
| `Setting` | Configurări globale (feature flags: cupoane, COD) |

## Fluxul de comandă, pe scurt

```
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
```

## Documentație detaliată

Vezi **HELP.md** pentru:
- Fluxul complet de plată (user + admin), pas cu pas
- Sistemul de refund (card vs. cash)
- Gestionarea cupoanelor
- Gestionarea stocului și cazurile speciale
- Comenzi Artisan de întreținere
- Troubleshooting pentru problemele reale întâlnite în dezvoltare

## Comenzi utile de dezvoltare

```bash
# Rulează worker-ul de cozi (necesar pentru emailuri, finalizare stoc)
php artisan horizon

# Curăță rezervările de stoc abandonate (comenzi card, prag implicit 24h)
php artisan orders:release-stale-reservations --hours=24

# Curăță comenzile cash abandonate (prag implicit 14 zile)
php artisan orders:release-stale-cash --days=14

# Curăță cache-uri (necesar după modificări de config/.env)
php artisan optimize:clear
```

## Variabile de mediu esențiale

```env
QUEUE_CONNECTION=redis
STRIPE_KEY / STRIPE_SECRET / STRIPE_WEBHOOK_SECRET (config/services.php)
MAIL_MAILER=smtp
MAIL_ADMIN_ADDRESS=admin@yourcompany.com
FRONTEND_URL=http://localhost:5173
ELASTICSEARCH_HOST=http://127.0.0.1:9200
```

## Note pentru producție

- **Scheduler**: cron trebuie configurat pe server (`* * * * * php artisan schedule:run`) — fără el, comenzile de curățare a stocului nu rulează niciodată automat.
- **Horizon**: verifică `config/horizon.php` — fiecare coadă folosită în cod (`default`, `emails`, `inventory`) trebuie să aibă un supervisor configurat, altfel joburile rămân blocate silențios.
- **Rate limiting**: acțiunile de admin (complete/confirm-cash/release/restock) pot atinge limita implicită de throttle la testare rapidă repetată — frontend-ul are gărzi sincrone împotriva dublu-click, dar limita de server rămâne activă.