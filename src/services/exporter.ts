import { Platform } from "react-native";
import type { ReportRow } from "@/types";

export async function exportReportToPdf(opts: {
  title: string;
  rows: ReportRow[];
  filename?: string;
}) {
  const { title, rows, filename = "reporte.pdf" } = opts;

  if (Platform.OS === "web") {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(title, 14, 16);

    const body = rows.map(r => [r.date, r.items, r.subtotal.toFixed(2), r.total.toFixed(2)]);
    // @ts-ignore
    autoTable(doc, {
      head: [["Fecha", "Unidades", "Subtotal", "Total"]],
      body,
      startY: 22,
      styles: { fontSize: 9 },
    });

    doc.save(filename);
    return;
  }

  // Nativo: expo-print + expo-sharing
  const Print = await import("expo-print");
  const Sharing = await import("expo-sharing");

  const html = `
  <html>
  <head><meta charset="utf-8" />
    <style>
      body { font-family: system-ui, -apple-system, Roboto, sans-serif; }
      h1 { font-size: 18px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; text-align: left; }
      th { background: #f3f4f6; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <table>
      <thead><tr><th>Fecha</th><th>Unidades</th><th>Subtotal</th><th>Total</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr>
          <td>${r.date}</td>
          <td>${r.items}</td>
          <td>${r.subtotal.toFixed(2)}</td>
          <td>${r.total.toFixed(2)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { UTI: "com.adobe.pdf", mimeType: "application/pdf" });
}
