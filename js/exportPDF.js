// exportPDF.js - Detección mejorada para formato PDF

export function configurarExportPDF() {
  document.addEventListener("DOMContentLoaded", () => {
    const btnPDF = document.getElementById("btnPdf");
    
    if (btnPDF) {
      btnPDF.addEventListener("click", () => {
        const content = document.querySelector("main.content");
        
        // Verificar si la tabla se saldrá en el PDF (formato A4)
        if (tableWillExceedPDFWidth()) {
          // Mostrar popup de advertencia
          showOverflowWarning(() => {
            // Usuario confirma - proceder con descarga
            generatePDF(content);
          });
        } else {
          // No hay problema - descargar directamente
          generatePDF(content);
        }
      });
    }
  });

  // Función principal para detectar si la tabla se saldrá en el PDF
  function tableWillExceedPDFWidth() {
    const tabla = document.querySelector('#tablaObjetos');
    
    if (!tabla) {
      console.log("No se encontró la tabla");
      return false;
    }

    // Crear una copia temporal de la tabla para medir sin afectar la original
    const tablaClone = tabla.cloneNode(true);
    tablaClone.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      visibility: hidden;
      width: auto;
      table-layout: auto;
    `;
    document.body.appendChild(tablaClone);

    // Obtener el ancho real que ocuparía la tabla
    const tablaWidth = tablaClone.scrollWidth;
    
    // Limpiar la copia temporal
    document.body.removeChild(tablaClone);

    // Configuración de página A4 en landscape y portrait
    // A4 Portrait: 210mm = ~794px (a 96 DPI)
    // A4 Landscape: 297mm = ~1123px (a 96 DPI)  
    // Restamos márgenes (0.5 inch = 48px por cada lado)
    const A4_PORTRAIT_WIDTH = 794 - (48 * 2); // ~698px útiles
    const A4_LANDSCAPE_WIDTH = 1123 - (48 * 2); // ~1027px útiles
    
    // También verificar cuántas columnas están visibles
    const columnasVisibles = tabla.querySelectorAll('thead th:not([style*="display: none"])').length;
    
    console.log("=== DETECCIÓN PARA PDF ===");
    console.log(`Ancho real de la tabla: ${tablaWidth}px`);
    console.log(`Ancho útil A4 Portrait: ${A4_PORTRAIT_WIDTH}px`);
    console.log(`Ancho útil A4 Landscape: ${A4_LANDSCAPE_WIDTH}px`);
    console.log(`Columnas visibles: ${columnasVisibles}`);
    
    // Criterios para mostrar warning:
    // 1. La tabla es más ancha que A4 Portrait (orientación por defecto)
    // 2. O tiene demasiadas columnas (más de 8 suele ser problemático en PDF)
    const exceedsPortrait = tablaWidth > A4_PORTRAIT_WIDTH;
    const exceedsLandscape = tablaWidth > A4_LANDSCAPE_WIDTH;
    const tooManyColumns = columnasVisibles > 8;
    
    // Mostrar advertencia si se sale en portrait (ya que es la orientación por defecto)
    const shouldWarning = exceedsPortrait || tooManyColumns;
    
    console.log(`¿Excede A4 Portrait? ${exceedsPortrait}`);
    console.log(`¿Excede A4 Landscape? ${exceedsLandscape}`);
    console.log(`¿Demasiadas columnas? ${tooManyColumns}`);
    console.log(`¿Mostrar advertencia? ${shouldWarning}`);
    console.log("=== FIN DETECCIÓN PDF ===");
    
    return shouldWarning;
  }

  // Función para mostrar el popup de advertencia
  function showOverflowWarning(onConfirm) {
    // Crear overlay del popup
    const overlay = document.createElement('div');
    overlay.className = 'pdf-warning-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Crear contenido del popup
    const popup = document.createElement('div');
    popup.className = 'pdf-warning-popup';
    popup.style.cssText = `
      background: white;
      padding: 32px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      text-align: center;
      transform: scale(0.9);
      transition: transform 0.2s ease;
    `;

    // Contenido HTML del popup - TEXTO ACTUALIZADO
    popup.innerHTML = `
      <div style="margin-bottom: 24px;">
        <div style="
          width: 64px; 
          height: 64px; 
          margin: 0 auto 20px; 
          background: linear-gradient(135deg, #f59e0b, #d97706); 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        ">
          <span style="color: white; font-size: 28px; font-weight: bold;">⚠</span>
        </div>
        
        <h3 style="
          margin: 0 0 12px 0; 
          color: #1f2937; 
          font-size: 1.3rem; 
          font-weight: 600;
        ">La tabla se saldrá del PDF</h3>
        
        <p style="
          margin: 0 0 20px 0; 
          color: #6b7280; 
          line-height: 1.6; 
          font-size: 1rem;
        ">
          La tabla actual es demasiado ancha para el formato A4 del PDF. 
          Las columnas pueden aparecer cortadas, muy pequeñas o ilegibles en el documento descargado.
        </p>
        
        <div style="
          margin: 20px 0; 
          padding: 16px; 
          background: linear-gradient(135deg, #fef3c7, #fde68a); 
          border-radius: 8px; 
          border-left: 4px solid #f59e0b;
        ">
          <p style="
            margin: 0; 
            color: #92400e; 
            font-size: 0.9rem; 
            font-weight: 500;
          ">
            💡 <strong>Recomendación:</strong> Desactiva algunas columnas del panel lateral para optimizar la visualización en el PDF.
          </p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="cancelPdfExport" style="
          padding: 12px 24px;
          border: 2px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          min-width: 120px;
        ">Cancelar</button>
        
        <button id="continuePdfExport" style="
          padding: 12px 24px;
          border: none;
          background: linear-gradient(135deg, #1f2937, #374151);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          min-width: 120px;
        ">Descargar PDF</button>
      </div>
    `;

    // Animación de entrada
    setTimeout(() => {
      popup.style.transform = 'scale(1)';
    }, 10);

    // Referencias a los botones
    const cancelBtn = popup.querySelector('#cancelPdfExport');
    const continueBtn = popup.querySelector('#continuePdfExport');

    // Efectos hover para botón cancelar
    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.background = '#f9fafb';
      cancelBtn.style.borderColor = '#9ca3af';
      cancelBtn.style.transform = 'translateY(-1px)';
    });
    
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.background = 'white';
      cancelBtn.style.borderColor = '#d1d5db';
      cancelBtn.style.transform = 'translateY(0)';
    });

    // Efectos hover para botón continuar
    continueBtn.addEventListener('mouseenter', () => {
      continueBtn.style.background = 'linear-gradient(135deg, #374151, #4b5563)';
      continueBtn.style.transform = 'translateY(-1px)';
      continueBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
    
    continueBtn.addEventListener('mouseleave', () => {
      continueBtn.style.background = 'linear-gradient(135deg, #1f2937, #374151)';
      continueBtn.style.transform = 'translateY(0)';
      continueBtn.style.boxShadow = 'none';
    });

    // Event listeners para acciones
    cancelBtn.addEventListener('click', () => {
      closePopup();
    });

    continueBtn.addEventListener('click', () => {
      closePopup();
      onConfirm(); // Ejecutar la descarga
    });

    // Función para cerrar el popup con animación
    function closePopup() {
      popup.style.transform = 'scale(0.9)';
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 200);
    }

    // Cerrar con ESC
    function handleKeyPress(e) {
      if (e.key === 'Escape') {
        closePopup();
        document.removeEventListener('keydown', handleKeyPress);
      }
    }
    document.addEventListener('keydown', handleKeyPress);

    // Cerrar al hacer click fuera del popup
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePopup();
      }
    });

    // Agregar al DOM
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  }

  // Función para generar el PDF
  function generatePDF(content) {
    // Mostrar indicador de carga
    const loadingIndicator = showLoadingIndicator();

    // Configuración para html2pdf
    const options = {
      margin: 0.5,
      filename: 'navantia-export.pdf',
      image: { 
        type: 'jpeg', 
        quality: 0.98 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait'
      }
    };

    // Generar PDF
    html2pdf()
      .set(options)
      .from(content)
      .save()
      .then(() => {
        console.log('PDF generado exitosamente');
        hideLoadingIndicator(loadingIndicator);
      })
      .catch((error) => {
        console.error('Error al generar PDF:', error);
        hideLoadingIndicator(loadingIndicator);
        showErrorMessage('Error al generar el PDF. Por favor, intenta de nuevo.');
      });
  }

  // Indicador de carga
  function showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'pdf-loading-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 24px 32px;
      border-radius: 12px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    indicator.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div class="spinner" style="
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        "></div>
      </div>
      <div style="font-weight: 500;">Generando PDF...</div>
      <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 4px;">Esto puede tomar unos segundos</div>
    `;

    // Agregar animación CSS
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

  // Ocultar indicador de carga
  function hideLoadingIndicator(indicator) {
    if (indicator && document.body.contains(indicator)) {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translate(-50%, -50%) scale(0.9)';
      setTimeout(() => {
        if (document.body.contains(indicator)) {
          document.body.removeChild(indicator);
        }
      }, 200);
    }
  }

  // Mostrar mensaje de error
  function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      max-width: 300px;
    `;
    
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        errorDiv.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
          }
        }, 300);
      }
    }, 5000);
  }
}