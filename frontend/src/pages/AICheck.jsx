import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PaymentModal from "../components/PaymentModal";
import { Alert, Button, PageHeader, ResultBadge, Spinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import api, { errorMessage } from "../lib/api";
import { openReport } from "../lib/report";

const MAX_SIZE = 10 * 1024 * 1024;

export default function AiCheck() {
  const { profile, setProfile } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const inputRef = useRef(null);

  const usesLeft = profile?.uses_left ?? 0;

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pickFile = (picked) => {
    setError("");
    setResult(null);
    if (!picked) return;
    if (!picked.type.startsWith("image/")) return setError("Choose an image file (JPEG or PNG).");
    if (picked.size > MAX_SIZE) return setError("This image is larger than 10 MB.");
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const analyse = async () => {
    if (!file) return;
    if (usesLeft < 1) return setPaying(true);
    setLoading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("scan", file);
      const { data } = await api.post("/predict-scan/", body);
      setResult(data);
      setProfile((p) => ({ ...p, uses_left: data.uses_left }));
    } catch (err) {
      if (err.response?.status === 402) setPaying(true);
      else setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    try {
      const { data } = await api.post("/fake-payment/");
      setProfile((p) => ({ ...p, uses_left: data.total_uses }));
      setPaying(false);
    } catch (err) {
      throw new Error(errorMessage(err));
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  const downloadReport = async () => {
    try {
      await openReport(result.scan.id);
    } catch (err) {
      setError(errorMessage(err, "The report could not be generated."));
    }
  };

  return (
    <>
      <PageHeader title="Analyse a chest X-ray">
        Upload a frontal chest X-ray. Each analysis uses one credit and the scan is saved in{" "}
        <Link to="/results" className="font-bold text-brand hover:underline">
          My scans
        </Link>
        .
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Upload / preview */}
        <div className="rounded-2xl bg-film p-4 md:p-6">
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Selected X-ray" className="mx-auto max-h-[28rem] rounded-lg object-contain" />
              {loading && (
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="scan-line absolute inset-x-0 h-16 -translate-y-full bg-gradient-to-b from-transparent via-mint/35 to-mint/80 [animation-iteration-count:infinite]" />
                </div>
              )}
            </div>
          ) : (
            <label
              htmlFor="xray"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer.files[0]);
              }}
              className={`flex min-h-80 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center text-white/70 transition-colors ${
                dragging ? "border-mint bg-white/5" : "border-white/20 hover:border-white/40"
              }`}
            >
              <svg className="size-10 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-display text-xl font-bold text-white">Drop your X-ray here</span>
              <span>or click to choose a file · JPEG or PNG, up to 10 MB</span>
            </label>
          )}
          <input
            ref={inputRef}
            id="xray"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => pickFile(e.target.files[0])}
          />
        </div>

        {/* Panel */}
        <aside className="space-y-5 self-start rounded-2xl bg-white p-6 ring-1 ring-line">
          <div className="flex items-center justify-between">
            <span className="text-muted">Credits left</span>
            <span className="font-display text-2xl font-bold">{profile ? usesLeft : "…"}</span>
          </div>

          {result ? (
            <div className="space-y-4 border-t border-line pt-5">
              <h2 className="text-2xl font-bold">Result</h2>
              <ResultBadge label={result.label} confidence={result.confidence} />
              <p className="text-sm text-muted">
                {result.label === "Pneumonia"
                  ? "The model found patterns often seen in pneumonia. Please have this result checked by a doctor."
                  : "The model did not find signs of pneumonia. If you have symptoms, a doctor can still examine you."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={downloadReport}>Download PDF report</Button>
                <Button variant="outline" onClick={reset}>
                  Analyse another X-ray
                </Button>
              </div>
              {result.label === "Pneumonia" && (
                <Link to="/appointment" className="block font-bold text-brand hover:underline">
                  Book an appointment with a doctor
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3 border-t border-line pt-5">
              {file && <p className="truncate text-sm text-muted">Selected: {file.name}</p>}
              <Button onClick={analyse} disabled={!file || loading} className="w-full">
                {loading ? (
                  <>
                    <Spinner /> Analysing…
                  </>
                ) : usesLeft < 1 && profile ? (
                  "Buy credits to analyse"
                ) : (
                  "Analyse X-ray"
                )}
              </Button>
              {file && !loading && (
                <Button variant="outline" onClick={() => inputRef.current.click()} className="w-full">
                  Choose another image
                </Button>
              )}
              {usesLeft < 1 && profile && (
                <Button variant="ghost" onClick={() => setPaying(true)} className="w-full">
                  Buy 3 scans (demo payment)
                </Button>
              )}
            </div>
          )}

          {error && <Alert tone="error">{error}</Alert>}

          <p className="border-t border-line pt-4 text-xs text-muted">
            Screening aid from a student project. It does not replace a medical diagnosis.
          </p>
        </aside>
      </div>

      <PaymentModal open={paying} onPay={pay} onClose={() => setPaying(false)} />
    </>
  );
}
