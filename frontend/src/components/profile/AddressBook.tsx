// components/profile/AddressBook.tsx
import { useState } from "react";
import { toast } from "react-toastify";
import { useAddresses } from "../../hooks/useAddresses";
import { useAddressMutations } from "../../hooks/useAddressMutations";
import BillingAddressForm from "../BillingAddressForm";
import { BillingData, emptyBillingData } from "../../types/checkout";

interface AddressBookProps {
  type: "billing" | "shipping";
  title: string;
}

export default function AddressBook({ type, title }: AddressBookProps) {
  const { data: addresses, isLoading } = useAddresses(type);
  const { create, update, remove } = useAddressMutations();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<BillingData>(emptyBillingData);

  const startEdit = (a: any) => { setEditingId(a.id); setForm(a); };
  const startNew = () => { setEditingId("new"); setForm(emptyBillingData); };
  const cancel = () => setEditingId(null);

  const save = () => {
    const payload = { ...form, type };
    if (editingId === "new") {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Address added"); setEditingId(null); },
        onError: () => toast.error("Could not save address"),
      });
    } else if (editingId) {
      update.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { toast.success("Address updated"); setEditingId(null); },
        onError: () => toast.error("Could not update address"),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this address?")) return;
    remove.mutate(id, { onSuccess: () => toast.success("Address deleted") });
  };

  const setDefault = (a: any) => {
    update.mutate({ id: a.id, data: { ...a, is_default: true } }, {
      onSuccess: () => toast.success("Default address updated"),
    });
  };

  if (isLoading) return <div className="text-muted">Loading {title.toLowerCase()}...</div>;

  return (
    <section className="mb-4">
      <h3 className="mb-3">{title}</h3>

      {addresses && addresses.length > 0 && (
        <div className="d-flex flex-column gap-2 mb-3">
          {addresses.map((a: any) => (
            <div key={a.id} className="border rounded-3 p-3 d-flex justify-content-between align-items-start">
              <div>
                {a.is_default && <span className="badge bg-primary mb-1">Default</span>}
                {a.company_name && <p className="mb-0 fw-semibold">{a.company_name}</p>}
                <p className="mb-0">{a.first_name} {a.last_name}</p>
                <p className="mb-0">{a.address_line_1}{a.address_line_2 ? `, ${a.address_line_2}` : ""}</p>
                <p className="mb-0">{a.city}, {a.state} {a.postal_code}</p>
                <p className="mb-0 text-muted">{a.country}</p>
                {a.phone && <p className="mb-0 text-muted">{a.phone}</p>}
              </div>
              <div className="d-flex flex-column gap-1">
                <button type="button" className="btn btn-link btn-sm" onClick={() => startEdit(a)}>Edit</button>
                {!a.is_default && (
                  <button type="button" className="btn btn-link btn-sm" onClick={() => setDefault(a)}>Set default</button>
                )}
                <button type="button" className="btn btn-link btn-sm text-danger" onClick={() => handleDelete(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId ? (
        <div className="border rounded-3 p-3">
          <BillingAddressForm
            data={form}
            setData={setForm}
            title={editingId === "new" ? `New ${title}` : `Edit ${title}`}
            requirePhone={type === "shipping"}
            showDeliveryInstructions={type === "shipping"}
          />
          <div className="d-flex gap-2 mt-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={save}>Save</button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={startNew}>
          + Add address
        </button>
      )}
    </section>
  );
}