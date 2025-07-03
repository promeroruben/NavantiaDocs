import { configurarExportPDF } from './exportPDF.js';
configurarExportPDF();
import { configurarExportExcel } from './exportExcel.js';
configurarExportExcel();
import { initControlesAdmin } from './adminControls.js';



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
      configurarAplicarFiltros(datosGlobales);
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
            th.draggable = true;
            th.textContent = nombreCampo;

            // Agregar a la cabecera
            cabeceraTabla.appendChild(th);

            // ← EVENTOS DRAG AND DROP
            th.addEventListener('dragstart', handleDragStart);
            th.addEventListener('dragover', handleDragOver);
            th.addEventListener('drop', handleDrop);
            th.addEventListener('dragend', handleDragEnd);
            th.addEventListener('dragenter', handleDragEnter);
            th.addEventListener('dragleave', handleDragLeave);

            // Crear celdas para cada fila
            cuerpoTabla.querySelectorAll("tr").forEach((fila, index) => {
              const td = document.createElement("td");
              td.classList.add(`col-${id}`);
              td.setAttribute("data-col", id);
              td.setAttribute("contenteditable", "true");
              td.textContent = datosGlobales[index]?.[nombreCampo] ?? "";
              fila.appendChild(td);
            });
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
// 👤 GESTIÓN DE USUARIO LOGUEADO
// ───────────────────────────────────────────────
function cargarDatosUsuario() {
  const username = localStorage.getItem("loggedUser");
  const rol = localStorage.getItem("userRole");

  if (!username || !rol) {
    window.location.href = "login.html";
    return;
  }

  // Mostrar nombre y rol
  const userNameElement = document.getElementById('userName');
  const userRoleElement = document.getElementById('userRole'); // <- Asegúrate de tener este en el HTML

  if (userNameElement) userNameElement.textContent = username;
  if (userRoleElement) userRoleElement.textContent = rol.charAt(0).toUpperCase() + rol.slice(1);

  // También mostrar iniciales en avatar
  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar) userAvatar.textContent = generarIniciales(username);
}


// Función para generar iniciales automáticamente
function generarIniciales(nombreCompleto) {
  return nombreCompleto
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
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
    // Highlight toda la columna
    highlightColumn(this.dataset.col, true);
  }
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
  // Remover highlight de toda la columna
  highlightColumn(this.dataset.col, false);
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
  // Remover highlight de toda la columna
  highlightColumn(this.dataset.col, false);
  return false;
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  
  // Limpiar todas las clases de drag-over y highlights
  document.querySelectorAll('#tablaObjetos th').forEach(th => {
    th.classList.remove('drag-over');
    highlightColumn(th.dataset.col, false);
  });
  
  draggedColumn = null;
}

// Función para highlighting de columnas completas
function highlightColumn(colId, highlight) {
  const elements = document.querySelectorAll(`[data-col="${colId}"]`);
  elements.forEach(element => {
    if (highlight) {
      element.classList.add('column-highlight');
    } else {
      element.classList.remove('column-highlight');
    }
  });
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
  const rol = localStorage.getItem("userRole");

  if (username) {
    const userDisplay = document.getElementById("userName");
    if (userDisplay) userDisplay.textContent = username;

    if (rol === "admin") {
      document.body.classList.add("admin"); // Para aplicar estilos o mostrar elementos
    }
  } else {
    window.location.href = "login.html";
  }
}


// ───────────────────────────────────────────────
// 🔧 FILTROS DINÁMICOS
// ───────────────────────────────────────────────
function configurarFiltrosDinamicos() {
  const maxFilters = 15;
  
  // Contadores para cada tipo de filtro
 window.filterCounts = {
    orden: 1,
    pep: 1
  };

  function addFilter(type) {
    if (filterCounts[type] >= maxFilters) return;
    
    const container = document.querySelector(`#${type}Filters .filter-inputs`);
    const newWrapper = document.createElement('div');
    newWrapper.className = 'filter-input-wrapper';
    newWrapper.innerHTML = `
      <input type="text" placeholder="Buscar..." style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; margin-bottom: 0.5rem;">
    `;
    
    container.appendChild(newWrapper);
    filterCounts[type]++;
    
    updateRemoveButtonState(type);
  }

  function removeFilter(type) {
    if (filterCounts[type] <= 1) return;
    
    const container = document.querySelector(`#${type}Filters .filter-inputs`);
    const lastWrapper = container.lastElementChild;
    
    if (lastWrapper) {
      lastWrapper.remove();
      filterCounts[type]--;
    }
    
    updateRemoveButtonState(type);
  }

  function updateRemoveButtonState(type) {
    const removeBtn = document.querySelector(`[data-type="${type}"].remove-filter-btn`);
    if (removeBtn) {
      removeBtn.disabled = filterCounts[type] <= 1;
    }
  }

  // Event listeners para botones de añadir
  document.querySelectorAll('.add-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      addFilter(type);
    });
  });

  // Event listeners para botones de quitar
  document.querySelectorAll('.remove-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      removeFilter(type);
    });
    
    // Estado inicial
    updateRemoveButtonState(btn.dataset.type);
  });
}


// ───────────────────────────────────────────────
//  BOTON LIMPIAR
// ───────────────────────────────────────────────

function configurarLimpiarFiltros() {
  const btnLimpiar = document.querySelector('.filter-actions button');
  
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      // Limpiar fechas
      const fechaDesde = document.getElementById('fechaDesde');
      const fechaHasta = document.getElementById('fechaHasta');
      
      if (fechaDesde) {
        fechaDesde.value = '';
        fechaDesde.removeAttribute('max');
      }
      if (fechaHasta) {
        fechaHasta.value = '';
        fechaHasta.removeAttribute('min');
      }
      
      // Limpiar todos los inputs de filtros dinámicos
      document.querySelectorAll('.filter-inputs input[type="text"]').forEach(input => {
        input.value = '';
      });
      
      // Resetear filtros dinámicos a su estado inicial
      resetearFiltrosDinamicos();
      
      console.log('Filtros limpiados');
      // Mostrar todas las filas al limpiar
      document.querySelectorAll('#cuerpoTabla tr').forEach(fila => {
        fila.style.display = '';
      });

    });
  }
}

function resetearFiltrosDinamicos() {
  const filterTypes = ['orden', 'pep'];
  
  filterTypes.forEach(type => {
    const container = document.querySelector(`#${type}Filters .filter-inputs`);
    if (container) {
      // Eliminar todos los wrappers excepto el primero
      const wrappers = container.querySelectorAll('.filter-input-wrapper');
      for (let i = 1; i < wrappers.length; i++) {
        wrappers[i].remove();
      }
      
      // Limpiar el primer input
      const firstInput = container.querySelector('input[type="text"]');
      if (firstInput) {
        firstInput.value = '';
      }
    }
    
    // Resetear contador
    if (window.filterCounts) {
      window.filterCounts[type] = 1;
    }
    
    // Actualizar estado del botón de remover
    const removeBtn = document.querySelector(`[data-type="${type}"].remove-filter-btn`);
    if (removeBtn) {
      removeBtn.disabled = true;
    }
  });
}

// ───────────────────────────────────────────────
// 📅 RESTRICCIÓN DE FECHAS
// ───────────────────────────────────────────────
function configurarRestriccionFechas() {
  const fechaDesde = document.getElementById('fechaDesde');
  const fechaHasta = document.getElementById('fechaHasta');
  
  if (!fechaDesde || !fechaHasta) return;
  
  function validar() {
    if (fechaDesde.value) {
      fechaHasta.min = fechaDesde.value;
    }
    if (fechaHasta.value) {
      fechaDesde.max = fechaHasta.value;
    }
  }
  
  fechaDesde.addEventListener('change', validar);
  fechaHasta.addEventListener('change', validar);
}


// ───────────────────────────────────────────────
// FILTRO 
// ───────────────────────────────────────────────


function configurarAplicarFiltros(datosGlobales) {
  const btnAplicar = document.getElementById('btnAplicarFiltros');
  if (!btnAplicar) return;

  btnAplicar.addEventListener('click', () => {
  const ordenes = Array.from(document.querySelectorAll('#ordenFilters input'))
    .map(input => input.value.trim().toLowerCase())
    .filter(val => val !== '');

  const peps = Array.from(document.querySelectorAll('#pepFilters input'))
    .map(input => input.value.trim().toLowerCase())
    .filter(val => val !== '');

  const fechaDesde = document.getElementById('fechaDesde')?.value;
  const fechaHasta = document.getElementById('fechaHasta')?.value;

  document.querySelectorAll('#cuerpoTabla tr').forEach((fila, index) => {
    const dato = datosGlobales[index];

    const matchOrden =
      ordenes.length === 0 ||
      ordenes.some(val => (dato["Orden"] || '').toLowerCase().includes(val));

    const matchPep =
      peps.length === 0 ||
      peps.some(val => (dato["Elemento PEP"] || '').toLowerCase().includes(val));

        let fechaItem = null;
    if (dato["Fecha inic."]) {
      const partes = dato["Fecha inic."].split("-");
      if (partes.length === 3) {
        const [a, m, d] = partes;
        fechaItem = new Date(a, m - 1, d);
      }
    }

    const matchFecha =
      (!fechaDesde || (fechaItem && fechaItem >= new Date(fechaDesde))) &&
      (!fechaHasta || (fechaItem && fechaItem <= new Date(fechaHasta)));

    if (matchOrden && matchPep && matchFecha) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  });
});
}



// ───────────────────────────────────────────────
// 🔁 INICIALIZACIÓN GENERAL
// ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Configurar los botones de toggle para las categorías
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const grupo = btn.closest(".grupo-campos");
      grupo.classList.toggle("open");
    });
  });
  checkLoggedUser();
  // Inicializar todas las funcionalidades
  cargarDatosUsuario(); 
  configurarCheckboxesYTabla();
  configurarLogout();
  configurarToggleColumnaIntermedia();
  configurarFiltrosDinamicos();
  initControlesAdmin();
  configurarRestriccionFechas();
  configurarLimpiarFiltros();
});