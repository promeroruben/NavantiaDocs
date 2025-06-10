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
// 🔵 TOGGLE COLUMNA INTERMEDIA
// ───────────────────────────────────────────────
function configurarToggleColumnaIntermedia() {
  const toggleBtn = document.getElementById("toggleRightTable");
  const container = document.getElementById("rightTableContainer");

  if (toggleBtn && container) {
    toggleBtn.addEventListener("click", () => {
      container.classList.toggle("collapsed");
      toggleBtn.textContent = container.classList.contains("collapsed") ? "»" : "«";
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
      window.location.href = "login.html";
    });
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

  configurarCheckboxesYTabla();
  configurarLogout();
  configurarToggleColumnaIntermedia(); // ← Añádelo aquí
});
