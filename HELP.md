# Ghid Operațional — ShopCore

Acest document explică fluxurile complete de business (plată, comenzi, refund, cupoane, stoc), din perspectiva userului și a adminului, plus soluții pentru problemele reale întâlnite în dezvoltare.

---

## 1. Checkout & Plată

Userul poate alege între **Card (Stripe)** și **Cash on Delivery (COD)**. Alegerea e vizibilă doar dacă metoda e disponibilă pentru coșul curent.

### Reguli de disponibilitate COD

Setate din admin (`Settings → Cash on Delivery`):
- `cod_enabled` — comutator global, dezactivează COD complet
- `cod_max_order_value` — comenzile peste această sumă nu pot folosi COD (protecție anti-fraudă)
- `cod_fee` — taxă suplimentară opțională pentru COD

COD e disponibil **doar** dacă:
1. E activat global
2. Coșul conține cel puțin un produs fizic (necesită livrare)
3. Totalul comenzii ≤ `cod_max_order_value`

Aceste reguli sunt verificate **de două ori**: în frontend (UX, ascunde opțiunea) și în backend (`CashPaymentHandler::isAvailableFor()`, sursa finală de adevăr).

### Flux — plată cu Card

```
1. User completează checkout, alege "Card"
2. CheckoutService rezervă stocul, creează Order (status: pending)
3. StripeService creează o sesiune Stripe Checkout
4. User e redirecționat la checkout.stripe.com
5. La succes → Stripe trimite webhook 'checkout.session.completed'
6. StripeWebhookController → OrderPaymentService::markPaid()
   → status: paid, email trimis, stoc finalizat (quantity scade real)
7. User revine pe /success → clearCart()
```

### Flux — plată Cash on Delivery

```
1. User completează checkout, alege "Cash on Delivery"
2. CheckoutService rezervă stocul, creează Order (status: pending, payment_method: cash)
3. NU există sesiune Stripe — user e dus direct la /order-confirmation
4. Email "Order Placed - Pay on Delivery" trimis automat
5. Comanda rămâne 'pending' până la livrare
6. La livrare, ADMINUL confirmă manual din OrdersTab → "Confirm Cash Received"
   → OrderPaymentService::markPaid() (ACEEAȘI cale ca la card)
   → status: paid, email standard de confirmare, stoc finalizat
```

**Important**: stocul se **rezervă** identic pentru ambele metode, la momentul checkout-ului. Diferența e doar în momentul **finalizării** (scăderii reale din stoc) — la card se întâmplă automat prin webhook, la cash se întâmplă manual prin acțiunea adminului.

---

## 2. Order Management

### Stări posibile ale unei comenzi

```
pending → paid → refunded
   ↓
cancelled
```

### Acțiuni disponibile în admin (OrdersTab)

| Buton | Când apare | Ce face |
|---|---|---|
| **Mark as Completed** | `status: pending`, plată card | Marchează manual ca plătită (webhook ratat, transfer bancar) |
| **Confirm Cash Received** | `payment_method: cash`, `status: pending` | Confirmă primirea numerarului la livrare |
| **Cancel & Release Stock** | `status: pending` | Anulează comanda, eliberează rezervarea de stoc (nu scade stocul real) |
| **Manually Restock Items** | `refunded_total > 0` | Repune manual stocul, pentru cazuri de refund parțial unde produsul s-a întors fizic |
| **Issue Refund** | `status: paid`, nu e complet rambursată | Deschide modalul de rambursare directă |

### Safety nets automate (comenzi Artisan, rulate prin scheduler)

```bash
# Comenzi card abandonate — verifică la fiecare oră, eliberează după 24h
php artisan orders:release-stale-reservations --hours=24

# Comenzi cash abandonate — verifică zilnic, eliberează după 14 zile
# (interval mult mai lung — COD stă legitim 'pending' zile întregi în tranzit)
php artisan orders:release-stale-cash --days=14
```

Programate în `routes/console.php`:
```php
Schedule::command('orders:release-stale-reservations --hours=24')->hourly();
Schedule::command('orders:release-stale-cash --days=14')->daily();
```

**Fără cron configurat pe server, aceste comenzi nu rulează niciodată automat** — verifică `crontab -e`:
```
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## 3. Refund System

### Două căi de inițiere

**A. Admin inițiază direct** (din `OrdersTab → Issue Refund`)
Aprobă și execută în același pas.

**B. Client cere refund** (din `Dashboard → Request Refund`)
```
Client cere refund → status: 'requested' (NIMIC financiar nu se întâmplă încă)
    ↓
Admin vede cererea în tab-ul "Refund Requests" (cu badge de notificare)
    ↓
Admin APROBĂ → execuție reală (Stripe sau bookkeeping cash)
Admin RESPINGE → status: 'rejected', client notificat prin email
```

### Card vs. Cash — diferență critică

| | Card | Cash |
|---|---|---|
| Sursă de adevăr pentru suma disponibilă | Stripe (`PaymentIntent.amount_received`) | `order.total` din DB (nu există gateway extern) |
| Execuție | Apel real către Stripe API | Doar înregistrare — banii au fost deja returnați manual de admin prin alt mijloc |
| `stripe_refund_id` | Populat | `null` |

**De ce Stripe și nu DB pentru card**: DB-ul poate diverge de la ce a încasat efectiv Stripe (bug de calcul, corectare manuală). Verificarea directă la Stripe elimină clasa asta de bug — un refund nu poate depăși niciodată ce s-a încasat cu adevărat.

### Restock automat

La refund **complet** (suma rambursată ≥ totalul comenzii), stocul se repune automat — fără ambiguitate, tot ce s-a vândut s-a și rambursat.

La refund **parțial**, stocul **nu** se repune automat (nu se știe care produs anume, din câte, corespunde sumei parțiale) — adminul folosește butonul manual "Manually Restock Items" dacă produsul a fost fizic returnat.

---

## 4. Cupoane

### Configurare (admin → tab Coupons)

- **Switch global**: dezactivează complet câmpul de cupon din checkout, indiferent de cupoanele individuale
- **Per cupon**: `code`, `type` (percent/fixed), `value`, `min_subtotal`, `usage_limit`, `starts_at`/`ends_at`, `is_active`

### Validare, în două locuri

1. **Preview** (`POST /coupons/validate`) — la apăsarea "Apply" în checkout, read-only, nu incrementează `used_count`
2. **Aplicare reală** (`CouponApplier`, în timpul checkout-ului) — cu `lockForUpdate()`, ca două checkout-uri concurente pe același cupon limitat să nu poată depăși amândouă `usage_limit`

### Discount-ul la Stripe

Stripe nu acceptă `unit_amount` negativ, deci discount-ul e distribuit proporțional direct în prețul fiecărui produs din sesiunea Stripe (nu ca linie separată), aplicat **doar** pe produse, niciodată pe shipping/VAT.

---

## 5. Inventory & Stock Management

### Cele două cifre esențiale

```
Stoc disponibil pentru vânzare = quantity - reserved
```

- `quantity` — stocul fizic real
- `reserved` — blocat temporar, pentru comenzi neplătite încă

### Cele patru operații

| Operație | Când | Efect |
|---|---|---|
| `reserve()` | La checkout | `reserved += qty` |
| `finalize()` | Comandă devine `paid` | `quantity -= qty`, `reserved -= qty` |
| `release()` | Comandă abandonată/anulată | `reserved -= qty` (quantity neatins) |
| `restock()` | Refund complet | `quantity += qty` |

Toate operațiile folosesc `lockForUpdate()` pe rândul de `Inventory`, ca două tranzacții concurente (doi clienți cumpărând ultima bucată simultan) să nu poată amândouă trece validarea de stoc disponibil.

### Semnul "⚠️ N items held"

Apare în admin (editare produs → variante) când `reserved > 0`. Înseamnă stoc blocat de comenzi `pending` neconfirmate încă. **Normal** pentru comenzi recente în curs de plată; **anormal** dacă rămâne mult timp pe o comandă foarte veche — verifică manual în acest caz (vezi Troubleshooting).

---

## 6. Troubleshooting — probleme reale întâlnite

### "Stocul nu scade după plată"

Cauze posibile, în ordine:
1. **Queue worker nu rulează** — verifică `php artisan horizon` activ; verifică `config/horizon.php` are supervisor pentru coada `inventory`
2. **Webhook Stripe nu ajunge** — local, ai nevoie de `stripe listen --forward-to localhost:8000/api/stripe/webhook`; verifică `STRIPE_WEBHOOK_SECRET` corespunde cu cel din `stripe listen`
3. Verifică log-uri: `tail -f storage/logs/laravel.log`, caută `--- WEBHOOK HIT ---`

### "⚠️ N items held" rămâne blocat mult timp

Identifică comanda orfană:
```php
php artisan tinker
>>> $variant = \App\Models\ProductVariant::find(ID);
>>> \App\Models\OrderItem::where('product_variant_id', $variant->id)->with('order')
    ->get()->map(fn($i) => [
        'order_id' => $i->order_id,
        'status' => $i->order->status,
        'finalized' => $i->order->inventory_finalized_at,
        'released' => $i->order->inventory_released_at,
    ]);
```
Caută comanda cu `status: pending`, `finalized: null`, `released: null` — asta ține rezervarea. Eliberează manual:
```php
>>> $order = \App\Models\Order::find(ORDER_ID);
>>> app(\App\Services\InventoryService::class)->release($order);
```

### "Missing payment intent - cannot refund" pe comandă cash

Comenzile cash nu au niciodată `payment_intent_id` (nu există tranzacție Stripe). `RefundService` trebuie să ramifice explicit pe `$order->payment_method === 'cash'` înainte de orice logică Stripe — verifică că această ramură există în `refund()`/`approveRequest()`.

### Suma din factura PDF diferă de Stripe/dashboard

Facturile PDF sunt **cache-uite** (Spatie MediaLibrary) — generate o singură dată, servite identic la orice request ulterior, chiar dacă `order.total` se schimbă. Fix: verifică `created_at` al media-ului față de `order.updated_at` înainte de a servi cache-ul; regenerează dacă comanda s-a modificat de atunci.

### Toast fals "COD is no longer available" imediat după o comandă cash reușită

Cauza: `clearCart()` apelat înainte ca `Checkout` să se demonteze face `requiresShipping` să devină `false`, ceea ce face `codAvailable` să pară "dispărut". Fix: mută `clearCart()` pe pagina de confirmare (`OrderConfirmation.tsx`), nu în `handleCheckout`.

### 429 Too Many Requests pe acțiuni de admin (complete/confirm-cash/release/restock)

De obicei cauzat de dublu-click înainte ca React să actualizeze `disabled` pe buton. Fix: gardă sincronă la începutul fiecărui handler, verificată **înainte** de orice `await`:
```tsx
const handleAction = async (order) => {
  if (processingId !== null) return; // blochează al doilea click imediat
  // ...
};
```
Dacă limita de throttle a fost deja atinsă, așteaptă ~60s sau curăță cache-ul de rate limit local.

### "Column not found" / "Unknown column" după modificări de schemă

Verifică sincronizarea între migrație, model (`$fillable`, `$casts`) și orice serviciu care citește coloana respectivă direct (ex. `StripeService` citind `tax_total` în loc de `vat` după o redenumire). Căutare rapidă: `grep -r "nume_coloana_veche" app/`.

### Câmp generat automat (`invoice_number`) rămâne `null`

Dacă un listener `static::created()` face `update()`/`fill()`/`updateQuietly()`, câmpul trebuie să fie în `$fillable` — altfel Laravel îl ignoră silențios, fără nicio eroare. Pentru câmpuri sistem-generate (niciodată din user input), preferă `forceFill()->saveQuietly()`, care ocolește intenționat verificarea, păstrând `$fillable` strict pentru restul modelului.

### Modificări la un model/service nu se reflectă în tinker

Tinker încarcă clasele o singură dată, la pornire. Orice editare de fișier **după** ce sesiunea a pornit necesită `exit` + repornire `php artisan tinker`. Dacă tot nu se reflectă, rulează `php artisan optimize:clear`.

---

## 7. Comenzi de întreținere — curățare completă a comenzilor (doar dezvoltare/testare)

```php
php artisan tinker
```
```php
// 1. Șterge refund-urile și credit notes-urile media
\App\Models\Refund::all()->each(function ($refund) {
    $refund->clearMediaCollection('credit_notes');
    $refund->delete();
});

// 2. Șterge order items
\App\Models\OrderItem::query()->delete();

// 3. Șterge facturile media, apoi comenzile
\App\Models\Order::all()->each(function ($order) {
    $order->clearMediaCollection('invoices');
    $order->delete();
});

// 4. Resetează rezervările de stoc
\App\Models\Inventory::query()->update(['reserved' => 0]);
```

**Nu rula niciodată acest bloc în producție** — șterge ireversibil toate datele de comandă.