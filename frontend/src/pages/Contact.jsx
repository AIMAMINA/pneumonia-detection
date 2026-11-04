import { useState } from "react";
import { Alert, Button, Field, PageHeader } from "../components/ui";
import api, { errorMessage } from "../lib/api";

// Keys must match ContactMessage.SUBJECT_CHOICES in backend/api/models.py
const subjects = [
  { value: "symptoms", label: "Symptoms" },
  { value: "diagnosis", label: "AI results" },
  { value: "appointment", label: "Appointments" },
  { value: "report", label: "Medical report" },
];

const emptyForm = { first_name: "", last_name: "", email: "", phone: "", subject: "symptoms", message: "" };

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await api.post("/submit/", form);
      setStatus("sent");
      setForm(emptyForm);
    } catch (err) {
      setError(errorMessage(err));
      setStatus("idle");
    }
  };

  return (
    <>
      <PageHeader title="Contact the clinic">
        Questions about a result, an appointment or a report? Write to us and a member of the team replies by email.
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[1.5fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-line md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="first_name" label="First name" required autoComplete="given-name" value={form.first_name} onChange={update("first_name")} />
            <Field id="last_name" label="Last name" required autoComplete="family-name" value={form.last_name} onChange={update("last_name")} />
            <Field id="email" label="Email" type="email" required autoComplete="email" value={form.email} onChange={update("email")} />
            <Field id="phone" label="Phone" type="tel" required autoComplete="tel" value={form.phone} onChange={update("phone")} />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-bold">Subject</legend>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <label
                  key={s.value}
                  className="cursor-pointer rounded-lg border border-line px-3 py-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mint"
                >
                  <input type="radio" name="subject" value={s.value} checked={form.subject === s.value} onChange={update("subject")} className="sr-only" />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>

          <Field id="message" label="Message" as="textarea" rows={5} required value={form.message} onChange={update("message")} />

          {status === "sent" && <Alert tone="success">Message sent. We usually reply within two working days.</Alert>}
          {error && <Alert tone="error">{error}</Alert>}

          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send message"}
          </Button>
        </form>

        <aside className="space-y-6 self-start">
          <div className="rounded-2xl bg-film p-6 text-white">
            <h2 className="text-xl font-bold text-white">ElHakim clinic (demo)</h2>
            <dl className="mt-4 space-y-3 text-white/80">
              <div><dt className="text-sm text-white/50">Address</dt><dd>Rue Saïdani, Constantine</dd></div>
              <div><dt className="text-sm text-white/50">Email</dt><dd>contact@elhakim.dz</dd></div>
              <div><dt className="text-sm text-white/50">Hours</dt><dd>Sunday to Thursday, 9:00 to 17:00</dd></div>
            </dl>
          </div>
          <iframe
            title="Map of Rue Saïdani, Constantine"
            src="https://www.google.com/maps?q=Rue%20Sa%C3%AFdani%2C%20Constantine&output=embed"
            className="h-64 w-full rounded-2xl ring-1 ring-line"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </aside>
      </div>
    </>
  );
}
