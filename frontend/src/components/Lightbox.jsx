import xray from "../assets/xray-sample.webp";
import { ResultBadge } from "./ui";

/** Hero visual: a radiology light box with a sample X-ray being scanned once. */
export default function Lightbox() {
  return (
    <figure className="relative mx-auto w-full max-w-md">
      <div className="rounded-2xl bg-film-2 p-3 shadow-[0_30px_80px_-30px_rgba(14,28,43,0.9)] ring-1 ring-white/10">
        <div className="flex items-center justify-between px-1 pb-2.5 text-xs text-white/50">
          <span>chest_xray_03.jpeg</span>
          <span>150 × 150 · grayscale</span>
        </div>
        <div className="relative overflow-hidden rounded-lg bg-black">
          <img src={xray} alt="Sample chest X-ray with signs of pneumonia" className="aspect-[4/3] w-full object-cover opacity-90" />
          <div className="scan-line pointer-events-none absolute inset-x-0 h-16 -translate-y-full bg-gradient-to-b from-transparent via-mint/35 to-mint/80">
            <div className="absolute inset-x-0 bottom-0 h-px bg-mint shadow-[0_0_12px_2px] shadow-mint" />
          </div>
        </div>
      </div>
      <figcaption className="scan-reveal absolute -bottom-5 left-6 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-line">
        <p className="mb-1 text-xs text-muted">Model output, sample image</p>
        <ResultBadge label="Pneumonia" confidence={0.997} />
      </figcaption>
    </figure>
  );
}
