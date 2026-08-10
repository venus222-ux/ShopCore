<?php

namespace App\Services;

class TaxService //serviciu gestionează calculul TVA-ulu
{
    public static function vatPercent(): float //citește procentul de TVA din configurație
    {
        return (float) config('tax.vat_percent');
    }

    public static function vatRate(): float //returnează procentul sub formă de zecimal (ex: 0.19 pentru 19%)
    {
        return self::vatPercent() / 100;
    }

    public static function calculateVat(float $subtotal): float //calculează valoarea TVA și o rotunjește la 2 zecimale
    {
        return round(
            $subtotal * self::vatRate(),
            2
        );
    }

    public static function calculateTotal(float $subtotal): float //subtotal + TVA
    {
        return round(
            $subtotal + self::calculateVat($subtotal),
            2
        );
    }
}
