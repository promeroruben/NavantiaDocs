// exportPDF.js

export function configurarExportPDF() {
  document.addEventListener("DOMContentLoaded", () => {
    const btnPDF = document.getElementById("btnPdf");

    if (btnPDF) {
      btnPDF.addEventListener("click", () => {
        const content = document.querySelector("main.content");

        const options = {
          margin: 0.5,
          filename: 'navantia-docs.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(options).from(content).save();
      });
    }
  });
}
