import { useEffect, useState } from "react";
import { Alert, Button, ButtonLink, PageHeader, ResultBadge, Spinner } from "../components/ui";
import api, { API_URL, errorMessage } from "../lib/api";
import { openReport } from "../lib/report";

const fileUrl = (path) => (path?.startsWith("http") ? path : `${API_URL}${path}`);

function ScanCard({ scan, onUpdate }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const analyse = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/user/scans/${scan.id}/analyze/`);
      onUpdate(data.scan);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const report = async () => {
    setError("");
    try {
      await openReport(scan.id);
    } catch (err) {
      setError(errorMessage(err, "The report could not be generated."));
    }
  };

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line">
      <a href={fileUrl(scan.scan_file)} target="_blank" rel="noreferrer" className="block bg-film">
        <img
          src={fileUrl(scan.scan_file)}
          alt={`X-ray ${scan.scan_name}`}
          className="aspect-[4/3] w-full object-contain"
          loading="lazy"
        />
      </a>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h2 className="truncate text-lg font-bold">{scan.scan_name || "Chest X-ray"}</h2>
          <p className="text-sm text-muted">
            {new Date(scan.upload_date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
          {scan.description && <p className="mt-1 text-sm text-muted">{scan.description}</p>}
        </div>

        {scan.ai_result ? (
          <ResultBadge label={scan.ai_result} confidence={scan.ai_confidence} />
        ) : (
          <p className="text-sm text-muted">Not analysed yet. Scans added by your doctor are analysed for free.</p>
        )}

        {error && <Alert tone="error">{error}</Alert>}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {scan.ai_result ? (
            <Button variant="outline" onClick={report}>
              PDF report
            </Button>
          ) : (
            <Button onClick={analyse} disabled={busy}>
              {busy ? (
                <>
                  <Spinner /> Analysing…
                </>
              ) : (
                "Analyse with AI"
              )}
            </Button>
          )}
          <a
            href={fileUrl(scan.scan_file)}
            download
            className="inline-flex items-center rounded-lg px-3 py-2.5 font-bold text-brand hover:bg-brand/10"
          >
            Download image
          </a>
        </div>
      </div>
    </li>
  );
}

export default function Results() {
  const [scans, setScans] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/user/scans/")
      .then(({ data }) => setScans(data))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const update = (updated) => setScans((list) => list.map((s) => (s.id === updated.id ? updated : s)));

  return (
    <>
      <PageHeader title="My scans">
        Every X-ray you analysed, plus the ones your doctor added to your file.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-5">
        {error && <Alert tone="error">{error}</Alert>}
        {!scans && !error && (
          <p className="flex items-center gap-2 text-muted">
            <Spinner /> Loading your scans…
          </p>
        )}
        {scans?.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-line">
            <h2 className="text-2xl font-bold">No scans yet</h2>
            <p className="mt-2 text-muted">Analyse your first X-ray and it will appear here.</p>
            <ButtonLink to="/ai-check" className="mt-6">
              Analyse an X-ray
            </ButtonLink>
          </div>
        )}
        {scans?.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scans.map((scan) => (
              <ScanCard key={scan.id} scan={scan} onUpdate={update} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
