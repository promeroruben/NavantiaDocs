import { configurarExportPDF } from './exportPDF.js';
configurarExportPDF();
import { configurarExportExcel } from './exportExcel.js';
configurarExportExcel();


// ───────────────────────────────────────────────
// 🟢 2. CHECKBOXES + TABLA (Campos dinámicos)
// ───────────────────────────────────────────────
function moveColumn(id, direction) {
  const tableHeader = document.querySelector("#tablaObjetos thead tr");
  const tableBody = document.querySelector("#tablaObjetos tbody");
  const headers = [...tableHeader.children];
  const currentIndex = headers.findIndex(th => th.dataset.col === id);
  const targetIndex = currentIndex + direction;

  if (targetIndex < 0 || targetIndex >= headers.length) return;

  const currentTh = headers[currentIndex];
  const targetTh = headers[targetIndex];
  tableHeader.insertBefore(
    direction === -1 ? currentTh : targetTh,
    direction === -1 ? targetTh : currentTh
  );

  tableBody.querySelectorAll("tr").forEach(row => {
    const cells = [...row.children];
    const currentTd = cells[currentIndex];
    const targetTd = cells[targetIndex];
    row.insertBefore(
      direction === -1 ? currentTd : targetTd,
      direction === -1 ? targetTd : currentTd
    );
  });

  // Sync right panel block order
  const rightPanel = document.querySelector("aside.sidebar.right");
  const currentBlock = document.getElementById(`right-block-${id}`);
  if (!currentBlock) return;

  const allBlocks = [...rightPanel.querySelectorAll(".right-block")];
  const blockIndex = allBlocks.findIndex(el => el.id === currentBlock.id);
  const targetBlock = allBlocks[blockIndex + direction];

  if (targetBlock) {
    rightPanel.insertBefore(
      direction === -1 ? currentBlock : targetBlock,
      direction === -1 ? targetBlock : currentBlock
    );
  }
}


function sanitizeId(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w]/g, "_");
}

function configurarCheckboxesYTabla() {
  fetch("placeholders/navantia_placeholder_data.json")
    .then(response => response.json())
    .then(data => {
      const datosGlobales = data;
      const campos = new Set();
      const campoNombreMap = {};

      data.forEach(item => Object.keys(item).forEach(key => campos.add(key)));

      const categorias = ["Categoría 1", "Categoría 2", "Categoría 3", "Categoría 4"];
      const camposArray = Array.from(campos);
      const camposPorCategoria = Math.ceil(camposArray.length / categorias.length);

      categorias.forEach((categoria, index) => {
        const grupo = document.querySelector(`.grupo-campos[data-categoria="${categoria}"] .checkbox-list`);
        const inicio = index * camposPorCategoria;
        const fin = inicio + camposPorCategoria;

        camposArray.slice(inicio, fin).forEach(campo => {
          const campoId = sanitizeId(campo);
          campoNombreMap[campoId] = campo;

          const label = document.createElement("label");
          label.innerHTML = `<input type="checkbox" value="${campoId}"> ${campo}`;
          grupo.appendChild(label);
        });
      });

      setTimeout(() => {
        const cabeceraTabla = document.getElementById("cabeceraTabla");
        const cuerpoTabla = document.getElementById("cuerpoTabla");

        if (cuerpoTabla.children.length === 0) {
          datosGlobales.forEach((_, i) => {
            const fila = document.createElement("tr");
            fila.setAttribute("data-fila", i);
            cuerpoTabla.appendChild(fila);
          });
        }

        document.querySelectorAll(".checkbox-list input[type=checkbox]").forEach(checkbox => {
          const id = checkbox.value;
          const nombreCampo = campoNombreMap[id];

          function crearColumnaTabla() {
            const th = document.createElement("th");
            th.classList.add(`col-${id}`);
            th.setAttribute("data-col", id);
            th.style.position = "relative";
            th.draggable = true; // ← Hacer la columna arrastrable

            th.textContent = nombreCampo;

            const controls = document.createElement("span");
            controls.classList.add("th-controls-float");

            const btnLeft = document.createElement("button");
            btnLeft.classList.add("th-move-left");
            btnLeft.textContent = "←";

            const btnRight = document.createElement("button");
            btnRight.classList.add("th-move-right");
            btnRight.textContent = "→";

            controls.appendChild(btnLeft);
            controls.appendChild(btnRight);
            th.appendChild(controls);
            cabeceraTabla.appendChild(th);

            // ← EVENTOS DRAG AND DROP
            th.addEventListener('dragstart', handleDragStart);
            th.addEventListener('dragover', handleDragOver);
            th.addEventListener('drop', handleDrop);
            th.addEventListener('dragend', handleDragEnd);
            th.addEventListener('dragenter', handleDragEnter);
            th.addEventListener('dragleave', handleDragLeave);

            cuerpoTabla.querySelectorAll("tr").forEach((fila, index) => {
              const td = document.createElement("td");
              td.classList.add(`col-${id}`);
              td.setAttribute("data-col", id);
              td.setAttribute("contenteditable", "true");
              td.textContent = datosGlobales[index]?.[nombreCampo] ?? "";
              fila.appendChild(td);
            });

            btnLeft.addEventListener("click", () => moveColumn(id, -1));
            btnRight.addEventListener("click", () => moveColumn(id, 1));
          }

          function eliminarColumnaTabla() {
            cabeceraTabla.querySelector(`th.col-${id}`)?.remove();
            cuerpoTabla.querySelectorAll(`td.col-${id}`).forEach(td => td.remove());
          }

          checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
              crearColumnaTabla();
            } else {
              eliminarColumnaTabla();
            }
          });
        });
      }, 100);
    })
    .catch(error => {
      console.error("Error loading dynamic fields:", error);
    });
}


// ───────────────────────────────────────────────
// 🔄 DRAG AND DROP PARA COLUMNAS
// ───────────────────────────────────────────────
let draggedColumn = null;

function handleDragStart(e) {
  draggedColumn = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  if (this !== draggedColumn) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedColumn !== this) {
    const draggedId = draggedColumn.dataset.col;
    const targetId = this.dataset.col;
    
    // Encontrar las posiciones
    const tableHeader = document.querySelector("#tablaObjetos thead tr");
    const headers = [...tableHeader.children];
    const draggedIndex = headers.findIndex(th => th.dataset.col === draggedId);
    const targetIndex = headers.findIndex(th => th.dataset.col === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Mover la columna
      const direction = targetIndex > draggedIndex ? 1 : -1;
      const steps = Math.abs(targetIndex - draggedIndex);
      
      for (let i = 0; i < steps; i++) {
        moveColumn(draggedId, direction);
      }
    }
  }

  this.classList.remove('drag-over');
  return false;
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  
  // Limpiar todas las clases de drag-over
  document.querySelectorAll('#tablaObjetos th').forEach(th => {
    th.classList.remove('drag-over');
  });
  
  draggedColumn = null;
}


// ───────────────────────────────────────────────
// 🔵 TOGGLE COLUMNA INTERMEDIA
// ───────────────────────────────────────────────
function configurarToggleColumnaIntermedia() {
  const toggleBtn = document.getElementById("toggleRightTable");
  const container = document.getElementById("rightTableContainer");

  if (toggleBtn && container) {
    // Función para actualizar la posición del botón
    function updateButtonPosition() {
      if (container.classList.contains("collapsed")) {
        // Panel cerrado: botón al lado del sidebar izquierdo
        toggleBtn.style.right = "-20px";
        toggleBtn.style.left = "-30px"; // Posición fija desde el borde izquierdo
        toggleBtn.textContent = "»";
      } else {
        // Panel abierto: botón al borde derecho del panel
        toggleBtn.style.left = "";
        toggleBtn.style.right = "-20px";
        toggleBtn.textContent = "«";
      }
    }

    // Inicializar posición del botón
    updateButtonPosition();

    toggleBtn.addEventListener("click", () => {
      container.classList.toggle("collapsed");
      updateButtonPosition();
    });
  }
}

// ───────────────────────────────────────────────
// 🔴 LOGIN / LOGOUT
// ───────────────────────────────────────────────
function configurarLogout() {
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("loggedUser");
      window.location.href = "login.html";
    });
  }
}

function checkLoggedUser() {
  const username = localStorage.getItem("loggedUser");

  if (username) {
    const userDisplay = document.getElementById("userName");
    if (userDisplay) {
      userDisplay.textContent = username;
    }
  } else {
    window.location.href = "login.html";
  }
}


// ───────────────────────────────────────────────
// 🔁 INICIALIZACIÓN GENERAL
// ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const grupo = btn.closest(".grupo-campos");
      grupo.classList.toggle("open");
    });
  });
  checkLoggedUser();
  configurarCheckboxesYTabla();
  configurarLogout();
  configurarToggleColumnaIntermedia(); // ← Añádelo aquí
});
