<?php

namespace App\Exceptions;

use Exception;

class OutOfStockException extends Exception
{
    public function __construct(
        string $message, //mesajul de eroare (obligatoriu)
        //parametru opțional care stochează ID-ul variantei de produs care a rămas fără stoc.
        public readonly ?int $productVariantId = null,
    ) {
        parent::__construct($message);
    }
}

//**OutOfStockException este o excepție special creată pentru a
/**semnala că un produs (sau variantă) nu mai este pe stoc. */
