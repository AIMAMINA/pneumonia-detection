import { useState } from "react";
import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  light: "bg-white text-film hover:bg-paper",
  outline: "border border-line bg-white text-ink hover:border-brand hover:text-brand",
  ghost: "text-brand hover:bg-brand/10",
};

export function Button({ variant = "primary", className = "", ...props }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({ variant = "primary", className = "", ...props }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Field({ label, id, hint, as = "input", className = "", ...props }) {
  const Tag = as;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {props.required ? null : <span className="font-normal text-muted"> (optional)</span>}
      </label>
      <Tag
        id={id}
        name={id}
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-ink placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        {...props}
      />
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function PasswordField({ label, id, hint, className = "", ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          className="w-full rounded-lg border border-line bg-white py-2.5 pr-12 pl-3.5 text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted hover:text-ink"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="M3 3l18 18" />}
          </svg>
        </button>
      </div>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

const tones = {
  error: "border-danger/30 bg-danger/5 text-danger",
  success: "border-mint/30 bg-mint/10 text-[#13695e]",
  info: "border-brand/20 bg-brand/5 text-brand-dark",
};

export function Alert({ tone = "info", children }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function Spinner({ className = "size-5" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ResultBadge({ label, confidence }) {
  const pneumonia = label === "Pneumonia";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${
        pneumonia ? "bg-amber/15 text-[#8a5410]" : "bg-mint/15 text-[#13695e]"
      }`}
    >
      <span className={`size-2 rounded-full ${pneumonia ? "bg-amber" : "bg-mint"}`} />
      {pneumonia ? "Signs of pneumonia" : "No pneumonia detected"}
      {confidence != null && <span className="font-normal opacity-80">{Math.round(confidence * 100)}%</span>}
    </span>
  );
}

export function PageHeader({ title, children }) {
  return (
    <header className="mx-auto max-w-6xl px-5 pt-14 pb-8 md:pt-20">
      <h1 className="text-4xl font-extrabold md:text-5xl">{title}</h1>
      {children && <p className="mt-4 max-w-2xl text-lg text-muted">{children}</p>}
    </header>
  );
}
