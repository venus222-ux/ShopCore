<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class MongoLog extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'upload_logs';

    protected $fillable = [
        'product_id',
        'file_name',
        'size',
        'mime',
        'uploaded_by',
        'ip',
        'user_agent',
        'created_at'
    ];
    public $timestamps = false;
}
