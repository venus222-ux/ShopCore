<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Product;
use Illuminate\Foundation\Auth\User;

class FileUploaded
{
    use Dispatchable, SerializesModels;

    public $product;
    public $file; // array cu file_name, size, mime, path
    public $user;
    public $ip;
    public $userAgent;

    public function __construct(Product $product, array $file, $user, string $ip, string $userAgent)
    {
        $this->product = $product;
        $this->file = $file;
        $this->user = $user;
        $this->ip = $ip;
        $this->userAgent = $userAgent;
    }
}

/***
* FileUploaded este un eveniment care reprezintă faptul că un fișier a fost încărcat.
* Conține toate informațiile necesare listener-ului:
* $product – produsul asociat fișierului
* $file – fișierul încărcat (UploadedFile)
* $user – utilizatorul care a făcut upload-ul
* Se folosește constructorul pentru a trece datele evenimentului către listener.
* Gândire centrală: Event-ul nu face nimic singur, el doar spune “Hei, s-a întâmplat upload-ul acesta!”
* Next: app/Listeners/ogUploadToMongo.php
 */
