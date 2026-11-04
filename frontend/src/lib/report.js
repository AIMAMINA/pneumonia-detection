import api from "./api";

/** Fetch the PDF report with the auth header and open it in a new tab. */
export async function openReport(scanId) {
  const tab = window.open("", "_blank");
  try {
    const { data } = await api.get(`/user/scans/${scanId}/report/`, { responseType: "blob" });
    const url = URL.createObjectURL(data);
    if (tab) tab.location.href = url;
    else window.location.href = url;
  } catch (err) {
    tab?.close();
    throw err;
  }
}
