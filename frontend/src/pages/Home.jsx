import { Link } from "react-router-dom";
import Lightbox from "../components/Lightbox";
import { ButtonLink } from "../components/ui";
import { doctors, steps } from "../lib/content";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-film text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-16 pb-24 md:grid-cols-[1.05fr_1fr] md:pt-24">
          <div>
            <h1 className="text-5xl font-extrabold text-white md:text-6xl">
              A second look at your chest X‑ray, in seconds.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/75">
              Upload an X-ray and a neural network trained on thousands of images tells you whether it shows signs of
              pneumonia. Then book a doctor to confirm it.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink to="/ai-check" variant="light">
                Analyse an X-ray
              </ButtonLink>
              <ButtonLink to="/appointment" className="bg-transparent ring-1 ring-white/30 hover:bg-white/10">
                Book an appointment
              </ButtonLink>
            </div>
          </div>
          <Lightbox />
        </div>
      </section>

      {/* How it works: a real sequence, so numbered */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
        <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t-2 border-ink pt-5">
              <span className="font-display text-sm font-bold text-brand">Step {i + 1}</span>
              <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Honest limits */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="grid gap-8 rounded-2xl bg-white p-8 ring-1 ring-line md:grid-cols-[1fr_1.3fr] md:p-12">
          <h2 className="text-3xl font-bold">A screening aid, not a diagnosis</h2>
          <div className="space-y-4 text-muted">
            <p>
              The model only answers one question: does this X-ray look like the pneumonia cases it was trained on? It
              cannot see other conditions, and it can be wrong on images that differ from its training data.
            </p>
            <p>
              That is why every result comes with the model's confidence and a way to reach a doctor.{" "}
              <Link to="/about-us" className="font-bold text-brand underline-offset-4 hover:underline">
                Read how the model was built
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold md:text-4xl">The doctors behind the results</h2>
          <ButtonLink to="/appointment" variant="outline">
            Book a consultation
          </ButtonLink>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {doctors.map((d) => (
            <li key={d.name} className="flex gap-5 rounded-2xl bg-white p-5 ring-1 ring-line">
              <div className="flex h-36 w-28 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-paper">
                <img src={d.photo} alt="" className="h-full w-auto object-contain object-bottom" loading="lazy" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{d.name}</h3>
                <p className="text-sm font-bold text-brand">{d.role}</p>
                <p className="mt-2 text-sm text-muted">{d.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
