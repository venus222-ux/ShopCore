<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name ?? 'N/A',
            'email'       => $this->email ?? 'N/A',
            'roles'       => $this->getRoleNames()->isNotEmpty() ? $this->getRoleNames() : ['user'],
            'created_at'  => $this->created_at ? $this->created_at->toDateTimeString() : 'Unknown',
            'updated_at'  => $this->updated_at ? $this->updated_at->toDateTimeString() : 'Unknown',

            // ==================== BILLING FIELDS ====================
            'company_name'    => $this->company_name,
            'vat_number'      => $this->vat_number,
            'address_line_1'  => $this->address_line_1,
            'address_line_2'  => $this->address_line_2,
            'city'            => $this->city,
            'state'           => $this->state,
            'postal_code'     => $this->postal_code,
            'country'         => $this->country,
        ];
    }
}
