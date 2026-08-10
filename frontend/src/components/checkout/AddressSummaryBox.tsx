// components/checkout/AddressSummaryBox.tsx
import { Pencil } from "lucide-react";

interface AddressSummaryBoxProps {
  address: any;
  title: string;
  onChangeClick: () => void;
}

export default function AddressSummaryBox({ address, title, onChangeClick }: AddressSummaryBoxProps) {
  if (!address) return null;

  return (
    <div className="border rounded-3 p-3 d-flex justify-content-between align-items-start mb-3">
      <div>
        <div className="fw-semibold small text-muted mb-1">{title}</div>
        {address.company_name && <p className="mb-0 fw-semibold">{address.company_name}</p>}
        <p className="mb-0">{address.first_name} {address.last_name}</p>
        <p className="mb-0">
          {address.address_line_1}{address.address_line_2 ? `, ${address.address_line_2}` : ""}
        </p>
        <p className="mb-0">{address.city}, {address.state} {address.postal_code}</p>
        <p className="mb-0 text-muted">{address.country}</p>
        {address.phone && <p className="mb-0 text-muted">{address.phone}</p>}
        {address.delivery_instructions && (
          <p className="mb-0 text-muted fst-italic">"{address.delivery_instructions}"</p>
        )}
      </div>
      <button type="button" className="btn btn-link btn-sm d-flex align-items-center gap-1" onClick={onChangeClick}>
        <Pencil size={14} /> Change
      </button>
    </div>
  );
}