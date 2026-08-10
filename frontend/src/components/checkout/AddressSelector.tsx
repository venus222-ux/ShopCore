import AddressSummaryBox from "./AddressSummaryBox";

interface AddressSelectorProps {
  savedAddresses: any[];
  selectedAddressId: number | "new";
  setSelectedAddressId: (id: number | "new") => void;
  setBilling: (data: any) => void;
  emptyBilling: any;
  showSelector: boolean;
  setShowSelector: (v: boolean) => void;
}

export default function AddressSelector({
  savedAddresses,
  selectedAddressId,
  setSelectedAddressId,
  setBilling,
  emptyBilling,
  showSelector,
  setShowSelector,
}: AddressSelectorProps) {
  const isAddingNewAddress = selectedAddressId === "new";
  const selected = savedAddresses.find((a) => a.id === selectedAddressId);

  if (selected && !showSelector) {
    return (
      <AddressSummaryBox
        address={selected}
        title="Billing to"
        onChangeClick={() => setShowSelector(true)}
      />
    );
  }

  return (
    <div className="mb-4">
      {savedAddresses.length > 0 && (
        <div className="mb-3 d-flex flex-column gap-2">
          {savedAddresses.map((a: any) => (
            <label
              key={a.id}
              className={`border rounded-3 p-3 d-flex align-items-start gap-2 ${
                selectedAddressId === a.id ? "border-primary" : ""
              }`}
              style={{ cursor: "pointer" }}
            >
              <input
                type="radio"
                name="billing-address"
                className="form-check-input mt-1"
                checked={selectedAddressId === a.id}
                onChange={() => {
                  setSelectedAddressId(a.id);
                  setShowSelector(false);
                }}
              />
              <div>
                {a.company_name && <p className="mb-0">{a.company_name}</p>}
                <p className="mb-0">{a.first_name} {a.last_name}</p>
                <p className="mb-0">{a.address_line_1}</p>
                {a.address_line_2 && <p className="mb-0">{a.address_line_2}</p>}
                <p className="mb-0">{a.city}, {a.state} {a.postal_code}</p>
                <p className="mb-0 text-muted">{a.country}</p>
              </div>
            </label>
          ))}

          <label
            className={`border rounded-3 p-3 d-flex align-items-center gap-2 ${
              isAddingNewAddress ? "border-primary" : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            <input
              type="radio"
              name="billing-address"
              className="form-check-input"
              checked={isAddingNewAddress}
              onChange={() => {
                setSelectedAddressId("new");
                setBilling(emptyBilling);
              }}
            />
            <span>+ Use a new address</span>
          </label>
        </div>
      )}
    </div>
  );
}