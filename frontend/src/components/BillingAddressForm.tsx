import { ChangeEvent } from "react";
import styles from "../styles/Checkout.module.css";
import { COUNTRIES } from "../constants/Countries";
import { BillingData } from "../types/checkout";

interface BillingAddressFormProps {
  data: BillingData;
  setData: (data: BillingData | ((prev: BillingData) => BillingData)) => void;
  showSaveToProfile?: boolean;
  onSaveToProfileChange?: (save: boolean) => void;
  saveToProfile?: boolean;
  title?: string;
  requirePhone?: boolean;
  showDeliveryInstructions?: boolean;
}

const BillingAddressForm = ({
  data,
  setData,
  showSaveToProfile = false,
  onSaveToProfileChange,
  saveToProfile = false,
  title = "Billing Details",
  requirePhone = false,
  showDeliveryInstructions = false,
}: BillingAddressFormProps) => {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.billingSection}>
      <h3 className={styles.billingTitle}>{title}</h3>

      {/* Name */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>First Name</label>
          <input
            name="first_name"
            value={data.first_name}
            onChange={handleChange}
            placeholder="John"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Last Name</label>
          <input
            name="last_name"
            value={data.last_name}
            onChange={handleChange}
            placeholder="Doe"
            required
          />
        </div>
      </div>

      {/* Business Info */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>
            Company <span className={styles.optional}>(Optional)</span>
          </label>
          <input
            name="company_name"
            value={data.company_name || ""}
            onChange={handleChange}
            placeholder="e.g. Acme SRL"
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            VAT Number <span className={styles.optional}>(Optional)</span>
          </label>
          <input
            name="vat_number"
            value={data.vat_number || ""}
            onChange={handleChange}
            placeholder="e.g. RO12345678"
          />
        </div>
      </div>

      {/* Country / State / City */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Country</label>
          <select name="country" value={data.country} onChange={handleChange} required>
            <option value="">Select country...</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>State / County</label>
          <input name="state" value={data.state || ""} onChange={handleChange} placeholder="State" />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>City</label>
        <input name="city" value={data.city} onChange={handleChange} placeholder="City" required />
      </div>

      {/* Street */}
      <div className={styles.formGroup}>
        <label>Street Address Line 1</label>
        <input
          name="address_line_1"
          value={data.address_line_1}
          onChange={handleChange}
          placeholder="House number and street name"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>
          Street Address Line 2 <span className={styles.optional}>(Optional)</span>
        </label>
        <input
          name="address_line_2"
          value={data.address_line_2 || ""}
          onChange={handleChange}
          placeholder="Apartment, suite, etc."
        />
      </div>

      <div className={styles.formGroup}>
        <label>Postal Code</label>
        <input
          name="postal_code"
          value={data.postal_code}
          onChange={handleChange}
          placeholder="Zip code"
          required
        />
      </div>

      {/* Phone */}
      <div className={styles.formGroup}>
        <label>
          Phone Number {!requirePhone && <span className={styles.optional}>(Optional)</span>}
        </label>
        <input
          name="phone"
          type="tel"
          value={data.phone || ""}
          onChange={handleChange}
          placeholder="+40 7xx xxx xxx"
          required={requirePhone}
        />
      </div>

      {/* Delivery instructions - shipping only */}
      {showDeliveryInstructions && (
        <div className={styles.formGroup}>
          <label>
            Delivery Instructions <span className={styles.optional}>(Optional)</span>
          </label>
          <textarea
            name="delivery_instructions"
            value={data.delivery_instructions || ""}
            onChange={handleChange}
            placeholder="e.g. Leave with concierge, ring twice..."
            rows={2}
          />
        </div>
      )}

      {showSaveToProfile && onSaveToProfileChange && (
        <div className={styles.checkboxWrapper}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={saveToProfile}
              onChange={(e) => onSaveToProfileChange(e.target.checked)}
            />
            <span className={styles.checkboxText}>
              Save this address to my profile for future orders
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default BillingAddressForm;