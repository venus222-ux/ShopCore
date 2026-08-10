<?php

namespace App\Services;

use App\Models\MongoLog;

class MongoLogService
{
    public function logUpload(array $data)
    {
        MongoLog::create($data);
    }
}


/***
 * MongoLogService este clasa responsabilă doar de salvarea datelor în MongoDB.
* Metoda logUpload(array $data) primește un array cu informații despre upload și le salvează în colecția MongoDB folosind modelul MongoLog.
* Avantaj: orice alt loc din aplicație care trebuie să logheze ceva în MongoDB poate folosi același service, fără duplicare de cod.
* Gândire centrală: Service-ul separă logica de “cum se salvează” de restul aplicației.
* Next: backend/app/Events/FileUploaded.php
****/
