<?php


namespace App\Listeners;

use App\Events\FileUploaded;
use App\Services\MongoLogService;
use Illuminate\Contracts\Queue\ShouldQueue;

class LogUploadToMongo implements ShouldQueue
{
    protected $mongoService;

    public function __construct(MongoLogService $mongoService)
    {
        $this->mongoService = $mongoService;
    }

    public function handle(FileUploaded $event)
    {
        // $event->file este acum un array cu cheile: file_name, size, mime, path
        $this->mongoService->logUpload([
            'product_id' => $event->product->id,
            'file_name' => $event->file['file_name'],
            'size' => $event->file['size'],
            'mime' => $event->file['mime'],
            'uploaded_by' => $event->user->id,
            'ip' => $event->ip,
            'user_agent' => $event->userAgent,
            'created_at' => now(),
        ]);
    }
}

/****
* Listener-ul LogUploadToMongo ascultă evenimentul FileUploaded.
* Este marcat cu ShouldQueue → asta înseamnă că nu rulează imediat, ci se pune într-o coadă (queue), deci nu blochează răspunsul HTTP.
* Constructorul primește MongoLogService → injectare de dependență, deci listener-ul poate folosi service-ul de logging fără să știe detalii interne.
* În metoda handle:
* Extrage fișierul și datele din eveniment.
* Pregătește array-ul de log (nume fișier, dimensiune, MIME, utilizator, IP, user agent, timestamp).
* Trimite array-ul la MongoLogService::logUpload() care îl salvează în MongoDB.

* Gândire centrală: Listener-ul este responsabil să “execute efectul” atunci când evenimentul apare – în cazul tău, să facă logging-ul.
 */
