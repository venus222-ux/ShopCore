<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->invoice_number }}</title>

    <style>
        :root {
            --primary: #4f46e5;
            --dark: #0f172a;
            --slate-600: #475569;
            --slate-400: #94a3b8;
            --border-light: #e2e8f0;
            --bg-light: #f8fafc;
            --danger-bg: #fef2f2;
            --danger-text: #991b1b;
            --success-bg: #f0fdf4;
            --success-text: #166534;
        }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-size: 10pt;
            color: var(--dark);
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .invoice-box {
            max-width: 850px;
            margin: auto;
            padding: 50px;
            background: #ffffff;
        }

        /* ================= HEADER ================= */
        .header-table {
            width: 100%;
            margin-bottom: 45px;
            border-collapse: collapse;
        }

        .brand-name {
            font-size: 20pt;
            font-weight: 800;
            color: var(--primary);
            letter-spacing: -0.03em;
            margin: 0;
        }

        .company-details {
            color: var(--slate-600);
            font-size: 9pt;
            margin-top: 8px;
            line-height: 1.6;
        }

        .invoice-title-area {
            text-align: right;
            vertical-align: top;
        }

        .invoice-title {
            margin: 0;
            font-weight: 900;
            font-size: 26pt;
            letter-spacing: -0.02em;
            color: var(--dark);
            line-height: 1;
        }

        .invoice-meta {
            color: var(--slate-600);
            font-size: 9.5pt;
            margin-top: 8px;
            line-height: 1.5;
        }

        /* ================= INFO GRID (Billing + Shipping) ================= */
        .info-grid {
            width: 100%;
            margin-bottom: 45px;
            border-collapse: collapse;
        }

        .info-label {
            text-transform: uppercase;
            font-size: 7.5pt;
            font-weight: 700;
            color: var(--slate-400);
            letter-spacing: 0.08em;
            margin-bottom: 6px;
            display: block;
        }

        .billing-details {
            font-size: 9.5pt;
            color: var(--slate-600);
            line-height: 1.5;
        }

        .billing-details strong {
            color: var(--dark);
        }

        .status-area {
            text-align: right;
            vertical-align: top;
        }

        .paid-badge {
            background: var(--success-bg);
            color: var(--success-text);
            padding: 6px 14px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 8.5pt;
            letter-spacing: 0.05em;
            display: inline-block;
            border: 1px solid rgba(22, 101, 52, 0.1);
        }

        .ship-badge {
            display: inline-block;
            margin-top: 10px;
            background: #eef2ff;
            color: var(--primary);
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 7.5pt;
            font-weight: 700;
            letter-spacing: 0.03em;
        }

        /* ================= ITEMS TABLE ================= */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .items-table th {
            border-bottom: 2px solid var(--dark);
            color: var(--dark);
            text-transform: uppercase;
            font-size: 7.5pt;
            font-weight: 700;
            letter-spacing: 0.05em;
            padding: 12px 10px;
            text-align: left;
        }

        .items-table td {
            padding: 16px 10px;
            border-bottom: 1px solid var(--border-light);
            vertical-align: top;
            font-size: 9.5pt;
            color: var(--slate-600);
        }

        .item-description {
            font-weight: 600;
            color: var(--dark);
            display: block;
        }

        .text-right {
            text-align: right !important;
        }

        .old-price {
            text-decoration: line-through;
            color: var(--slate-400);
            font-size: 8.5pt;
            font-weight: 400;
            margin-bottom: 2px;
        }

        .discount-badge {
            display: inline-block;
            margin-top: 6px;
            background: var(--danger-bg);
            color: var(--danger-text);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 7.5pt;
            font-weight: 700;
            letter-spacing: 0.02em;
        }

        /* ================= SUMMARY ================= */
        .summary-wrapper {
            margin-top: 20px;
            width: 100%;
            page-break-inside: avoid;
        }

        .summary-table {
            width: 280px;
            margin-left: auto;
            border-collapse: collapse;
        }

        .summary-table td {
            padding: 8px 10px;
            font-size: 9.5pt;
            color: var(--slate-600);
        }

        .discount-row td {
            color: var(--danger-text);
            font-weight: 500;
        }

        .total-row {
            border-top: 1px solid var(--border-light);
        }

        .total-row td {
            padding-top: 16px;
            font-weight: 700;
            font-size: 13pt;
            color: var(--dark);
        }

        .total-label {
            color: var(--dark) !important;
        }

        .total-amount {
            color: var(--primary);
        }

        /* ================= FOOTER ================= */
        .footer {
            margin-top: 80px;
            font-size: 8.5pt;
            color: var(--slate-400);
            border-top: 1px solid var(--border-light);
            padding-top: 24px;
            text-align: center;
            line-height: 1.6;
            page-break-inside: avoid;
        }

        .variant-attributes {
           display: block;
           font-size: 8pt;
           color: var(--slate-400);
           margin-top: 3px;
        }

        @media print {
            body { background: #ffffff; }
            .invoice-box { padding: 0; max-width: 100%; }
            tr { page-break-inside: avoid; }
        }
    </style>
</head>

<body>

<div class="invoice-box">

    <!-- ================= HEADER ================= -->
    <table class="header-table">
        <tr>
            <td>
                <h2 class="brand-name">Your Company Name</h2>
                <div class="company-details">
                    Bucharest, Romania<br>
                    VAT: RO12345678 | Reg: J40/12345/2020<br>
                    hello@yourcompany.com
                </div>
            </td>

            <td class="invoice-title-area">
                <h1 class="invoice-title">INVOICE</h1>
                <div class="invoice-meta">
                    <span style="font-weight: 600; color: var(--dark);">#{{ $order->invoice_number }}</span><br>
                    {{ $order->created_at->format('d M Y') }}
                </div>
            </td>
        </tr>
    </table>

    <!-- ================= BILLING + SHIPPING ================= -->
    <table class="info-grid">
        <tr>
            <td style="width: 40%; vertical-align: top;">
                <span class="info-label">Bill To</span>
                <div class="billing-details">
                    @if($order->billing_company)
                        <strong>{{ $order->billing_company }}</strong><br>
                    @endif

                    {{ $order->billing_name }}<br>
                    {{ $order->billing_address_1 }}
                    @if($order->billing_address_2)
                        <br>{{ $order->billing_address_2 }}
                    @endif
                    <br>
                    {{ $order->billing_city }}, {{ $order->billing_postal_code }}<br>
                    {{ $order->billing_country }}

                    @if($order->billing_phone)
                        <br>{{ $order->billing_phone }}
                    @endif

                    @if($order->billing_vat_number)
                        <br>
                        <span style="font-size: 8.5pt; margin-top: 4px; display: inline-block;">
                            <strong>VAT:</strong> {{ $order->billing_vat_number }}
                        </span>
                    @endif
                </div>
            </td>

            @if($order->shipping_address_1)
                <td style="width: 40%; vertical-align: top;">
                    <span class="info-label">Ship To</span>
                    <div class="billing-details">
                        @if($order->shipping_company)
                            <strong>{{ $order->shipping_company }}</strong><br>
                        @endif

                        {{ $order->shipping_name }}<br>
                        {{ $order->shipping_address_1 }}
                        @if($order->shipping_address_2)
                            <br>{{ $order->shipping_address_2 }}
                        @endif
                        <br>
                        {{ $order->shipping_city }}, {{ $order->shipping_postal_code }}<br>
                        {{ $order->shipping_country }}

                        @if($order->shipping_phone)
                            <br>{{ $order->shipping_phone }}
                        @endif

                        @if($order->shippingMethod)
                            <span class="ship-badge">{{ $order->shippingMethod->name }}</span>
                        @endif
                    </div>
                </td>
            @endif

            <td class="status-area" style="width: {{ $order->shipping_address_1 ? '20%' : '60%' }}; vertical-align: top;">
                <span class="paid-badge">PAID</span>
            </td>
        </tr>

        @if($order->shipping_address_1 && $order->shipping_delivery_instructions)
            <tr>
                <td colspan="3" style="padding-top: 12px;">
                    <span class="info-label">Delivery Instructions</span>
                    <div class="billing-details" style="font-style: italic;">
                        {{ $order->shipping_delivery_instructions }}
                    </div>
                </td>
            </tr>
        @endif
    </table>

    <!-- ================= ITEMS ================= -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 45%">Description</th>
                <th class="text-right" style="width: 10%">Qty</th>
                <th class="text-right" style="width: 15%">Unit Price</th>
                <th class="text-right" style="width: 12%">VAT</th>
                <th class="text-right" style="width: 18%">Amount</th>
            </tr>
        </thead>

        <tbody>
        @foreach($order->items as $item)
            @php
                $product = $item->product;
                $originalPrice = (float) $item->price;
                $discountPercentage = (float) ($product->discount_percentage ?? 0);
                $discountFixed = (float) ($product->discount_fixed ?? 0);
                $discountAmount = 0;
                $discountLabel = null;

                if ($discountPercentage > 0) {
                    $discountAmount = $originalPrice * ($discountPercentage / 100);
                    $discountLabel = rtrim(rtrim(number_format($discountPercentage, 2), '0'), '.') . '% OFF';
                } elseif ($discountFixed > 0) {
                    $discountAmount = $discountFixed;
                    $discountLabel = '$' . number_format($discountFixed, 2) . ' OFF';
                }

                $finalPrice = max(0, $originalPrice - $discountAmount);
                $lineTotal = $finalPrice * $item->quantity;
            @endphp

            <tr>
              <td>
    <span class="item-description">
        {{ $product->title ?? 'Digital Product' }}
    </span>

    @if($item->variant && $item->variant->attributeValues && $item->variant->attributeValues->count())
        <span class="variant-attributes">
            {{ $item->variant->attributeValues
                ->map(fn ($av) => ($av->attribute->name ?? '') . ': ' . $av->value)
                ->implode(' | ') }}
        </span>
    @endif

    @if($discountLabel)
        <span class="discount-badge">{{ $discountLabel }}</span>
    @endif
</td>

                <td class="text-right" style="font-weight: 500; color: var(--dark);">
                    {{ $item->quantity }}
                </td>

                <td class="text-right">
                    @if($discountLabel)
                        <div class="old-price">${{ number_format($originalPrice, 2) }}</div>
                        <span style="font-weight: 600; color: var(--dark);">${{ number_format($finalPrice, 2) }}</span>
                    @else
                        <span style="font-weight: 600; color: var(--dark);">${{ number_format($originalPrice, 2) }}</span>
                    @endif
                </td>

                <td class="text-right">21%</td>

                <td class="text-right" style="font-weight: 600; color: var(--dark);">
                    ${{ number_format($lineTotal, 2) }}
                </td>

                <td class="status-area" style="width: {{ $order->shipping_address_1 ? '20%' : '60%' }}; vertical-align: top;">
                    <span class="paid-badge">
                      {{ $order->status === 'paid' ? 'PAID' : strtoupper($order->status) }}
                    </span>
                    <span class="ship-badge" style="margin-top: 6px;">
                       {{ $order->payment_method === 'cash' ? '💵 Cash on Delivery' : '💳 Card' }}
                    </span>
                    </td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <!-- ================= TOTALS ================= -->
    @php
        $originalSubtotal = $order->items->sum(function($item) {
            return $item->price * $item->quantity;
        });
        $discountTotal = max(0, $originalSubtotal - $order->subtotal);
    @endphp

    <div class="summary-wrapper">
        <table class="summary-table">
            <tr>
                <td>Original Subtotal</td>
                <td class="text-right">${{ number_format($originalSubtotal, 2) }}</td>
            </tr>

            @if($discountTotal > 0)
                <tr class="discount-row">
                    <td>Discounts</td>
                    <td class="text-right">-${{ number_format($discountTotal, 2) }}</td>
                </tr>
            @endif

            <tr>
                <td>Subtotal</td>
                <td class="text-right" style="font-weight: 500; color: var(--dark);">
                    ${{ number_format($order->subtotal, 2) }}
                </td>
            </tr>

            <tr>
                <td>VAT (21%)</td>
                <td class="text-right">${{ number_format($order->vat, 2) }}</td>
            </tr>

            @if($order->shipping_total > 0)
                <tr>
                    <td>Shipping @if($order->shippingMethod)({{ $order->shippingMethod->name }})@endif</td>
                    <td class="text-right">${{ number_format($order->shipping_total, 2) }}</td>
                </tr>
            @endif

            <tr class="total-row">
                <td class="total-label">Total</td>
                <td class="text-right total-amount">${{ number_format($order->total, 2) }}</td>
            </tr>
        </table>
    </div>

    <!-- ================= FOOTER ================= -->
    <div class="footer">
        <p style="margin: 0 0 8px 0;">
            This invoice is issued in accordance with EU VAT Directive 2006/112/EC.<br>
            Payment processed via Stripe.
        </p>
        <p style="margin: 0; font-weight: 600; color: var(--dark);">
            Thank you for your business!
        </p>
    </div>

</div>

</body>
</html>
