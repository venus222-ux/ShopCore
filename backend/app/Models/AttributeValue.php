<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class AttributeValue extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = ['attribute_id', 'value', 'slug', 'sort_order'];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    public function variants()
    {
        return $this->belongsToMany(ProductVariant::class, 'variant_attribute_value');
    }

    // No registerMediaCollections() here on purpose - images are stored
    // under a dynamically-named collection per product (see
    // AttributeValueController::collectionName()), since the same
    // AttributeValue row (e.g. Color: Brown) is shared across unrelated
    // products (a brown belt vs. a brown dress) and must not share
    // photos. Spatie doesn't require a collection to be pre-registered
    // to add/read media under a given name.
}