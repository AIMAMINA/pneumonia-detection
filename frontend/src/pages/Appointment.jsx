import { useEffect, useState } from "react";
import { Alert, Button, Field, PageHeader, Spinner } from "../components/ui";
import { doctors } from "../lib/content";
import api, { errorMessage } from "../lib/api";

const emptyForm = { full_name: "", phone_number: "", email: "", notes: "" };

const formatDay = (iso) =>
  new Date(`${iso}T00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

export default function Appointment() {
  const [dates, setDates] = useState(null);
  const [date, setDate] = useState(null);
  const [times, setTimes] = useState(null);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    api
      .get("/available-dates/")
      .then(({ data }) => setDates(data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  useEffect(() => {
    if (!date) return;
    setTimes(null);
    setTime(null);
    api
      .get("/available-times/", { params: { date: date.date } })
      .then(({ data }) => setTimes(data))
      .catch((err) => setError(errorMessage(err)));
  }, [date]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) return setError("Choose a day and a time first.");
    setLoading(true);
    setError("");
    try {
      await api.post("/appointments/", { ...form, date: date.id, time: time.id });
      setBooked({ day: formatDay(date.date), time: time.time });
      setForm(emptyForm);
      setDate(null);
      setTime(null);
      setTimes(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const slot = (selected) =>
    `rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
      selected ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand"
    }`;

  return (
    <>
      <PageHeader title="Book an appointment">
        Pick a day and a time, leave your details, and the clinic will confirm by email.
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[1.5fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl bg-white p-6 ring-1 ring-line md:p-8">
          {booked && (
            <Alert tone="success">
              Your appointment request for {booked.day} at {booked.time} has been sent. You will receive a confirmation
              email once the clinic accepts it.
            </Alert>
          )}

          <fieldset>
            <legend className="font-display text-xl font-bold">1. Day</legend>
            {!dates && !error && <Spinner className="mt-4 size-5 text-muted" />}
            {dates?.length === 0 && <p className="mt-3 text-muted">No days are open for booking right now.</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {dates?.map((d) => (
                <button type="button" key={d.id} aria-pressed={date?.id === d.id} onClick={() => setDate(d)} className={slot(date?.id === d.id)}>
                  {formatDay(d.date)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={!date}>
            <legend className="font-display text-xl font-bold">2. Time</legend>
            {!date && <p className="mt-3 text-muted">Choose a day to see the free times.</p>}
            {date && !times && <Spinner className="mt-4 size-5 text-muted" />}
            {times?.length === 0 && <p className="mt-3 text-muted">This day is fully booked. Try another one.</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {times?.map((t) => (
                <button type="button" key={t.id} aria-pressed={time?.id === t.id} onClick={() => setTime(t)} className={slot(time?.id === t.id)}>
                  {t.time}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="font-display text-xl font-bold">3. Your details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="full_name" label="Full name" required autoComplete="name" value={form.full_name} onChange={update("full_name")} />
              <Field id="phone_number" label="Phone" type="tel" required autoComplete="tel" value={form.phone_number} onChange={update("phone_number")} />
            </div>
            <Field id="email" label="Email" type="email" autoComplete="email" hint="Needed to receive the confirmation." value={form.email} onChange={update("email")} />
            <Field id="notes" label="Reason for the visit" as="textarea" rows={3} value={form.notes} onChange={update("notes")} />
          </fieldset>

          {error && <Alert tone="error">{error}</Alert>}

          <Button type="submit" disabled={loading || !time} className="w-full sm:w-auto">
            {loading ? "Booking…" : date && time ? `Book ${formatDay(date.date)} at ${time.time}` : "Book appointment"}
          </Button>
        </form>

        <aside className="self-start rounded-2xl bg-film p-6 text-white">
          <h2 className="text-xl font-bold text-white">Who you may see</h2>
          <ul className="mt-5 space-y-4">
            {doctors.map((d) => (
              <li key={d.name} className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-end justify-center overflow-hidden rounded-full bg-white/10">
                  <img src={d.photo} alt="" className="h-full w-auto object-contain object-bottom" />
                </div>
                <div>
                  <p className="font-bold">{d.name}</p>
                  <p className="text-sm text-white/70">{d.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
