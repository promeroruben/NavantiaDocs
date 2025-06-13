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

        // 🔹 Ajuste automático de ancho de columnas
        const columnWidths = data[2].map((_, colIndex) => {
          // Encuentra la celda más larga de cada columna
          const maxLength = data.map(row => (row[colIndex]?.length || 0)).reduce((a, b) => Math.max(a, b), 10);
          return { wch: maxLength + 2 }; // +2 para un poco de espacio extra
        });
        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Documento");

        // 🔹 Usar el texto del h2 editable como nombre del archivo
        const tituloDocumento = document.getElementById("tituloDocumento")?.textContent.trim() || "documento";
        const tituloLimpio = tituloDocumento.replace(/[\\/:*?"<>|]/g, "_"); // Elimina caracteres inválidos
        const nombreArchivo = `${tituloLimpio}.xlsx`;

        XLSX.writeFile(workbook, nombreArchivo);
      });
    }
  });
}
