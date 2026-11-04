import { useEffect, useRef, useState } from "react";
import { Alert, Button, Field } from "./ui";
import cib from "../assets/cib.webp";
import edahabia from "../assets/edahabia.webp";

/**
 * Demo checkout. Nothing is charged: the backend simply adds 3 scan credits.
 * Uses the native <dialog> element for focus trapping and Escape handling.
 */
export default function PaymentModal({ open, onPay, onClose }) {
  const ref = useRef(null);
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const digits = card.replace(/\D/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (digits.length !== 16) return setError("The card number must have 16 digits.");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return setError("Enter the expiry date as MM/YY.");
    setError("");
    setPaying(true);
    try {
      await onPay();
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl bg-white p-0 text-ink shadow-2xl backdrop:bg-film/60"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Buy 3 scans</h2>
            <p className="mt-1 text-muted">250 DA, paid with CIB or Edahabia.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted hover:text-ink">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <Alert tone="info">Demo mode: no money is charged. Any 16-digit number works.</Alert>

        <Field id="card-name" label="Name on card" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="cc-name" />
        <div className="relative">
          <Field
            id="card-number"
            label="Card number"
            required
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={card}
            onChange={(e) => setCard(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})(?=.)/g, "$1 "))}
          />
          <div className="pointer-events-none absolute right-3 bottom-2.5 flex gap-1.5">
            <img src={cib} alt="CIB" className="h-6" />
            <img src={edahabia} alt="Edahabia" className="h-6" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="card-expiry"
            label="Expiry"
            required
            placeholder="MM/YY"
            autoComplete="cc-exp"
            value={expiry}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
              setExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
            }}
          />
          <Field
            id="card-cvc"
            label="CVC"
            required
            inputMode="numeric"
            autoComplete="cc-csc"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={paying} className="flex-1">
            {paying ? "Paying…" : "Pay 250 DA"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </dialog>
  );
}
