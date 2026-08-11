<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');

        return auth()->user()
            ->addresses()
            ->when($type, fn ($q) => $q->where('type', $type))
            ->orderByDesc('is_default')
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        if (! empty($data['is_default'])) {
            $this->unsetOtherDefaults($data['type']);
        }

        $address = auth()->user()->addresses()->create($data);

        return response()->json($address, 201);
    }

    public function update(Request $request, Address $address)
    {
        $this->authorizeOwnership($address);

        $data = $this->validated($request, $address);

        if (! empty($data['is_default'])) {
            $this->unsetOtherDefaults($data['type'], $address->id);
        }

        $address->update($data);

        return response()->json($address);
    }

    public function destroy(Address $address)
    {
        $this->authorizeOwnership($address);
        $address->delete();

        return response()->json(['message' => 'Address deleted']);
    }

    private function unsetOtherDefaults(string $type, ?int $exceptId = null): void
    {
        auth()->user()->addresses()
            ->where('type', $type)
            ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
            ->update(['is_default' => false]);
    }

    private function validated(Request $request, ?Address $existing = null): array
    {
        $type = $request->input('type', $existing?->type);

        return $request->validate([
            'type' => 'required|in:billing,shipping',
            'label' => 'nullable|string|max:100',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'company_name' => 'nullable|string|max:255',
            'vat_number' => 'nullable|string|max:50',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|size:2',
            // phone is mandatory for shipping (couriers need it), optional for billing
            'phone' => $type === 'shipping' ? 'required|string|max:30' : 'nullable|string|max:30',
            'delivery_instructions' => 'nullable|string|max:500',
            'is_default' => 'boolean|nullable',
        ]);
    }

    private function authorizeOwnership(Address $address): void
    {
        abort_unless($address->user_id === auth()->id(), 403);
    }
}
