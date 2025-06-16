// exportPDF.js

export function configurarExportPDF() {
  document.addEventListener("DOMContentLoaded", () => {
    const btnPDF = document.getElementById("btnPdf");

    if (btnPDF) {
      btnPDF.addEventListener("click", () => {
        const content = document.querySelector("main.content");
        
        // Verificar si el contenido excede el tamaño de página
        if (checkContentOverflow(content)) {
          showOverflowWarning(() => {
            // Si el usuario confirma, proceder con la exportación
            exportToPDF(content);
          });
        } else {
          // Si no hay overflow, exportar directamente
          exportToPDF(content);
        }
      });
    }
  });

  // Función para verificar si el contenido excede el ancho de una página A4 (overflow de columnas)
  function checkContentOverflow(element) {
    // Buscar la tabla dentro del elemento content
    const tabla = element.querySelector('#tablaObjetos');
    
    if (!tabla) {
      return false; // Si no hay tabla, no hay overflow
    }

    // Contar columnas visibles (th elementos)
    const columnasVisibles = tabla.querySelectorAll('thead th').length;
    
    // Crear una copia temporal de la tabla para medición
    const tempTable = tabla.cloneNode(true);
    tempTable.style.position = 'absolute';
    tempTable.style.left = '-9999px';
    tempTable.style.top = '-9999px';
    tempTable.style.visibility = 'hidden';
    tempTable.style.width = 'auto';
    tempTable.style.tableLayout = 'auto';
    
    document.body.appendChild(tempTable);
    
    // Calcular ancho disponible en A4 (considerando márgenes de 0.5in a cada lado)
    const a4WidthInPx = (8.27 - 1) * 96; // 8.27in ancho A4 - 1in de márgenes = 7.27in * 96 DPI
    const tableWidth = tempTable.scrollWidth;
    
    // Limpiar el elemento temporal
    document.body.removeChild(tempTable);
    
    // Criterios para mostrar warning:
    // 1. Más de 8 columnas (criterio por cantidad)
    // 2. O ancho de tabla excede el ancho de página A4
    const tooManyColumns = columnasVisibles > 8;
    const widthExceedsPage = tableWidth > a4WidthInPx;
    
    console.log(`Columnas: ${columnasVisibles}, Ancho tabla: ${tableWidth}px, Límite A4: ${a4WidthInPx}px`);
    
    return tooManyColumns || widthExceedsPage;
  }

  // Función para mostrar el popup de advertencia
  function showOverflowWarning(onConfirm) {
    // Crear el overlay del popup
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: sans-serif;
    `;

    // Crear el contenido del popup
    const popup = document.createElement('div');
    popup.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      text-align: center;
    `;

    popup.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; margin: 0 auto 15px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 24px; font-weight: bold;">⚠</span>
        </div>
        <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 1.2rem;">Demasiadas columnas detectadas</h3>
        <p style="margin: 0; color: #6b7280; line-height: 1.5;">
          La tabla actual tiene muchas columnas y puede que no se visualice correctamente en el PDF. 
          Las columnas podrían aparecer muy estrechas, cortadas o solaparse entre sí.
        </p>
        <div style="margin: 15px 0; padding: 12px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 0.9rem; font-weight: 500;">
            💡 <strong>Sugerencia:</strong> Considera desmarcar algunas columnas innecesarias desde el panel izquierdo antes de generar el PDF.
          </p>
        </div>
      </div>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="cancelExport" style="
          padding: 10px 20px;
          border: 2px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        ">Cancelar</button>
        <button id="continueExport" style="
          padding: 10px 20px;
          border: none;
          background: #1f2937;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        ">Continuar de todas formas</button>
      </div>
    `;

    // Agregar efectos hover a los botones
    const cancelBtn = popup.querySelector('#cancelExport');
    const continueBtn = popup.querySelector('#continueExport');

    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.background = '#f3f4f6';
      cancelBtn.style.borderColor = '#9ca3af';
    });
    
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.background = 'white';
      cancelBtn.style.borderColor = '#d1d5db';
    });

    continueBtn.addEventListener('mouseenter', () => {
      continueBtn.style.background = '#374151';
    });
    
    continueBtn.addEventListener('mouseleave', () => {
      continueBtn.style.background = '#1f2937';
    });

    // Event listeners para los botones
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    continueBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      onConfirm();
    });

    // Cerrar con ESC
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', handleKeyPress);
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    // Cerrar al hacer click fuera del popup
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }

  // Función para exportar a PDF
  function exportToPDF(content) {
    const options = {
      margin: 0.5,
      filename: 'navantia-docs.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait'
      }
    };

    // Mostrar indicador de carga (opcional)
    const loadingIndicator = showLoadingIndicator();

    html2pdf().set(options).from(content).save().then(() => {
      // Ocultar indicador de carga cuando termine
      if (loadingIndicator) {
        document.body.removeChild(loadingIndicator);
      }
    }).catch((error) => {
      console.error('Error al generar PDF:', error);
      if (loadingIndicator) {
        document.body.removeChild(loadingIndicator);
      }
    });
  }

  // Función opcional para mostrar indicador de carga
  function showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 30px;
      border-radius: 8px;
      z-index: 10001;
      font-family: sans-serif;
      text-align: center;
    `;
    
    indicator.innerHTML = `
      <div style="margin-bottom: 10px;">
        <div style="border: 3px solid #f3f3f3; border-top: 3px solid #1f2937; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      </div>
      <div>Generando PDF...</div>
    `;

    // Agregar animación de rotación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(indicator);
    return indicator;
  }
}