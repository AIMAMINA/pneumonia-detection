import { ButtonLink } from "../components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-28 text-center">
      <p className="font-display text-7xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-3xl font-bold">This page does not exist</h1>
      <p className="mt-3 text-muted">The link may be broken or the page may have moved.</p>
      <ButtonLink to="/" className="mt-8">
        Back to the home page
      </ButtonLink>
    </div>
  );
}
