<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrafficLog extends Model
{
    protected $fillable = [
        'ip',
        'path',
        'source',
        'user_agent',
        'user_id',
        'browser',
        'platform',
        'device'

    ];
}
