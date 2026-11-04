import { ButtonLink, PageHeader } from "../components/ui";
import { modelFacts } from "../lib/content";
import about from "../assets/about.webp";

export default function About() {
  return (
    <>
      <PageHeader title="About ElHakim AI">
        A web platform where patients can screen a chest X-ray for pneumonia with AI, keep their scans in one place and
        book a consultation with a doctor.
      </PageHeader>

      <div className="mx-auto max-w-6xl px-5">
        <img src={about} alt="A doctor examining a chest X-ray" className="aspect-[21/8] w-full rounded-2xl object-cover" />

        <section className="mt-16 grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <h2 className="text-3xl font-bold">The model</h2>
          <div className="space-y-4 text-muted">
            <p>
              The classifier is a convolutional neural network built from scratch with TensorFlow/Keras. It was trained on
              about 14,000 frontal chest X-rays labelled <em>Normal</em> or <em>Pneumonia</em>, split 70 / 15 / 15 into
              training, validation and test sets.
            </p>
            <p>
              Each image is converted to grayscale, resized to 150 × 150 pixels and normalised. The network outputs a
              probability: above 0.5 the scan is flagged as pneumonia.
            </p>
            <dl className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
              {modelFacts.map((f) => (
                <div key={f.label} className="rounded-xl bg-white p-4 ring-1 ring-line">
                  <dt className="text-sm">{f.label}</dt>
                  <dd className="order-first font-display text-2xl font-bold text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <h2 className="text-3xl font-bold">The stack</h2>
          <ul className="grid gap-3 text-muted sm:grid-cols-2">
            <li><strong className="text-ink">Frontend:</strong> React, React Router, Tailwind CSS, Vite</li>
            <li><strong className="text-ink">API:</strong> Django REST Framework with JWT authentication</li>
            <li><strong className="text-ink">AI:</strong> TensorFlow / Keras CNN, Pillow, NumPy</li>
            <li><strong className="text-ink">Extras:</strong> PDF reports (xhtml2pdf), email notifications, Jazzmin admin</li>
          </ul>
        </section>

        <section className="mt-16 rounded-2xl bg-film p-8 text-white md:p-12">
          <h2 className="text-3xl font-bold text-white">Try it with your own X-ray</h2>
          <p className="mt-3 max-w-xl text-white/75">Create an account, buy scan credits in demo mode and get a result in seconds.</p>
          <ButtonLink to="/ai-check" variant="light" className="mt-6">
            Analyse an X-ray
          </ButtonLink>
        </section>
      </div>
    </>
  );
}
