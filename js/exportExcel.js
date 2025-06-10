// exportExcel.js

export function configurarExportExcel() {
  document.addEventListener("DOMContentLoaded", () => {
    const btnExcel = document.getElementById("btnExcel");

    if (btnExcel) {
      btnExcel.addEventListener("click", () => {
        const headerTitle = document.querySelector("header h1")?.textContent || "Título desconocido";
        const table = document.getElementById("tablaObjetos");
        const tableHeader = table.querySelector("thead tr");
        const tableRows = table.querySelectorAll("tbody tr");

        const data = [];

        data.push([headerTitle]);
        data.push([]);

        const headers = [...tableHeader.children].map(th => th.textContent.trim());
        data.push(headers);

        tableRows.forEach(tr => {
          const row = [...tr.children].map(td => td.textContent.trim());
          data.push(row);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Documento");

        XLSX.writeFile(workbook, "navantia-docs.xlsx");
      });
    }
  });
}
