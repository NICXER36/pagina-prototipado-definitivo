      let selectedRow = null;
      let selectedAppointmentRow = null;

      function logout() {
        localStorage.removeItem('session'); // Elimina la sesión almacenada
        window.location.href = 'index.html'; // Redirige al login
      }

      function selectRow(row) {
        // Si la fila clickeada es la misma que ya estaba seleccionada
        if (selectedRow === row) {
          row.classList.remove('selected');
          selectedRow = null;
          return;
        }

        // Deseleccionar la fila anterior si existe
        if (selectedRow) {
          selectedRow.classList.remove('selected');
        }

        // Seleccionar la nueva fila
        row.classList.add('selected');
        selectedRow = row;
      }

      function showPatientForm(mode) {
        const content = document.getElementById('content');
        
        // Crear el overlay
        let overlay = document.getElementById('overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'overlay';
          document.body.appendChild(overlay);
        }
        
        // Crear el contenedor del formulario
        let formContainer = document.getElementById('patientFormContainer');
        if (!formContainer) {
          formContainer = document.createElement('div');
          formContainer.id = 'patientFormContainer';
          formContainer.className = 'modal-form';
          document.body.appendChild(formContainer);
        }

        // Establecer el contenido del formulario
        formContainer.innerHTML = `
          <h2 id="formTitle">${mode === 'add' ? 'Agregar Paciente' : 'Modificar Paciente'}</h2>
          <form id="patientForm">
            <label>
              Correo:
              <input type="email" id="formCorreo" required />
            </label>
            <label>
              Nombre:
              <input type="text" id="formNombre" required />
            </label>
            <label>
              Apellido:
              <input type="text" id="formApellido" required />
            </label>
            <label>
              Fecha de Nacimiento:
              <input type="date" id="formFechaNacimiento" required />
            </label>
            <label>
              Edad:
              <input type="number" id="formEdad" required disabled />
            </label>
            <label>
              Sexo:
              <select id="formSexo" required>
                <option value="">Seleccione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </label>
            <label>
              RUT:
              <input type="text" id="formRUT" required />
            </label>
            <label>
              Teléfono:
              <input type="text" id="formTelefono" required />
            </label>
            <label>
              Dirección:
              <input type="text" id="formDireccion" required />
            </label>
            <label>
              Ciudad:
              <input type="text" id="formCiudad" required />
            </label>
            <label>
              Diagnóstico:
              <input type="text" id="formDiagnostico" />
            </label>
            <div class="form-buttons">
              <button type="button" onclick="savePatient()">Guardar</button>
              <button type="button" onclick="cancelPatientForm()">Cancelar</button>
            </div>
          </form>
        `;

        // Calcular edad automáticamente
        setTimeout(() => {
          const fechaNacimientoInput = document.getElementById('formFechaNacimiento');
          const edadInput = document.getElementById('formEdad');
          if (fechaNacimientoInput && edadInput) {
            fechaNacimientoInput.addEventListener('input', function() {
              const birthDate = new Date(this.value);
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              edadInput.value = isNaN(age) ? '' : age;
            });
          }
        }, 100);

        if (mode === 'edit' && selectedRow) {
          // Obtener el paciente seleccionado del localStorage
          const patients = JSON.parse(localStorage.getItem('patients')) || [];
          const selectedRut = selectedRow.querySelector('td:nth-child(1)').textContent;
          const patient = patients.find(p => p.rut === selectedRut);

          if (patient) {
            // Rellenar el formulario con los datos del paciente
            document.getElementById('formCorreo').value = patient.email || patient.correo || '';
            document.getElementById('formNombre').value = patient.name || patient.nombre || '';
            document.getElementById('formApellido').value = patient.lastName || patient.apellido || '';
            document.getElementById('formFechaNacimiento').value = patient.birthDate || patient.fechaNacimiento || '';
            document.getElementById('formEdad').value = patient.age || patient.edad || '';
            document.getElementById('formSexo').value = patient.sex || patient.sexo || '';
            document.getElementById('formRUT').value = patient.rut || '';
            document.getElementById('formTelefono').value = patient.phone || patient.telefono || '';
            document.getElementById('formDireccion').value = patient.address || patient.direccion || '';
            document.getElementById('formCiudad').value = patient.city || patient.ciudad || '';
            document.getElementById('formDiagnostico').value = patient.diagnosis || patient.diagnostico || '';
          }
        }

        // Mostrar el formulario y el overlay
        overlay.style.display = 'block';
        formContainer.style.display = 'block';
      }

      function savePatient() {
        const formContainer = document.getElementById('patientFormContainer');
        const overlay = document.getElementById('overlay');

        const patientData = {
          email: document.getElementById('formCorreo').value,
          name: document.getElementById('formNombre').value,
          lastName: document.getElementById('formApellido').value,
          birthDate: document.getElementById('formFechaNacimiento').value,
          age: document.getElementById('formEdad').value,
          sex: document.getElementById('formSexo').value,
          rut: document.getElementById('formRUT').value,
          phone: document.getElementById('formTelefono').value,
          address: document.getElementById('formDireccion').value,
          city: document.getElementById('formCiudad').value,
          diagnosis: document.getElementById('formDiagnostico').value,
          procesoKinesico: 0,
          to: 0,
          indiceIndependencia: 0,
          escalaAmputacion: 0,
          prioridad: 0
        };

        // Validar RUT longitud
        if (patientData.rut.length < 8 || patientData.rut.length > 10) {
          showModalAlert('El RUT debe tener entre 8 y 10 caracteres.');
          return;
        }

        // Validar que todos los campos obligatorios estén completos
        if (
          !patientData.email ||
          !patientData.name ||
          !patientData.lastName ||
          !patientData.birthDate ||
          !patientData.age ||
          !patientData.sex ||
          !patientData.rut ||
          !patientData.phone ||
          !patientData.address ||
          !patientData.city
        ) {
          showModalAlert('Todos los campos marcados son obligatorios.');
          return;
        }

        // Obtener pacientes existentes
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const existingPatientIndex = patients.findIndex(p => p.rut === patientData.rut);

        // Validar RUT único
        if (existingPatientIndex !== -1 && (!selectedRow || (selectedRow && patients[existingPatientIndex] !== patientData))) {
          showModalAlert('Ya existe un paciente con ese RUT.');
          return;
        }

        if (existingPatientIndex === -1) {
          // Es un nuevo paciente
          // Verificar si ya existe un paciente con ese RUT
          if (patients.some(p => p.rut === patientData.rut)) {
            showModalAlert('Ya existe un paciente con ese RUT.');
            return;
          }

          // Crear credenciales de usuario
          const rutParts = patientData.rut.split('-');
          const rutNumber = rutParts[0];
          const rutVerifier = rutParts[1];
          const lastThreeDigits = rutNumber.slice(-3);
          
          const username = `${patientData.name}.${patientData.lastName}.${lastThreeDigits}`.toLowerCase();
          const password = `Paciente.${patientData.lastName}.${rutVerifier}`;

          // Guardar credenciales de usuario
          const users = JSON.parse(localStorage.getItem('users')) || [];
          users.push({
            username: username,
            password: password,
            rut: patientData.rut,
            role: 'user'
          });
          localStorage.setItem('users', JSON.stringify(users));

          // Agregar nuevo paciente
          patients.push(patientData);
          showModalAlert(`Paciente agregado correctamente.\n\nCredenciales de acceso:\nUsuario: ${username}\nContraseña: ${password}`);
        } else {
          // Modificar paciente existente
          patients[existingPatientIndex] = patientData;
          showModalAlert('Paciente modificado correctamente.');
        }

        // Guardar en localStorage
        localStorage.setItem('patients', JSON.stringify(patients));

        // Actualizar la tabla
        loadPatients();

        // Limpiar y cerrar el formulario
        document.getElementById('patientForm').reset();
        formContainer.style.display = 'none';
        overlay.style.display = 'none';
        selectedRow = null;
      }

      function viewPatientDetails() {
        if (!selectedRow) {
          showModalAlert('Seleccione una fila para ver más detalles.');
          return;
        }

        // Obtener los datos del paciente desde localStorage
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patient = patients.find(p => p.rut === selectedRow.querySelector('td:nth-child(1)').textContent);

        if (!patient) {
          showModalAlert('No se encontraron datos del paciente.');
          return;
        }

        // Mostrar los detalles en un nuevo módulo
        const content = document.getElementById('content');
        content.innerHTML = `
          <h1>Detalles del Paciente</h1>
          <div class="patient-details">
            <p><strong>Correo:</strong> ${patient.email}</p>
            <p><strong>Nombre:</strong> ${patient.name}</p>
            <p><strong>Apellido:</strong> ${patient.lastName}</p>
            <p><strong>Fecha de Nacimiento:</strong> ${patient.birthDate}</p>
            <p><strong>Edad:</strong> ${patient.age}</p>
            <p><strong>RUT:</strong> ${patient.rut}</p>
            <p><strong>Teléfono:</strong> ${patient.phone}</p>
            <p><strong>Dirección:</strong> ${patient.address}</p>
            <p><strong>Ciudad:</strong> ${patient.city}</p>
            <p><strong>Diagnóstico:</strong> ${patient.diagnosis || 'No especificado'}</p>
            <h3>Datos Estadísticos</h3>
            <p><strong>Proceso Kinésico%:</strong> ${patient.procesoKinesico || 0}%</p>
            <p><strong>T.O%:</strong> ${patient.to || 0}%</p>
            <p><strong>Índice de Independencia Funcional%:</strong> ${patient.indiceIndependencia || 0}%</p>
            <p><strong>Escala Amputación y Prótesis%:</strong> ${patient.escalaAmputacion || 0}%</p>
            <p><strong>Prioridad:</strong> ${patient.prioridad ? patient.prioridad.toFixed(2) : 0}%</p>
          </div>
          <button onclick="showPatientManagement()">Volver</button>
        `;
      }

      function showWaitingList() {
        const content = document.getElementById('content');
        const waitingList = JSON.parse(localStorage.getItem('waitingList')) || [];
        // Filtros y ordenamiento
        content.innerHTML = `
          <h1>Lista de Espera</h1>
          <div class="filter-bar">
            <label><input type="checkbox" id="filterRutChk" checked> RUT <input type="text" id="filterRut" placeholder="RUT"></label>
            <label><input type="checkbox" id="filterNombreChk" checked> Nombre <input type="text" id="filterNombre" placeholder="Nombre"></label>
            <label><input type="checkbox" id="filterTipoChk" checked> Tipo Atención <input type="text" id="filterTipo" placeholder="Tipo Atención"></label>
            <label><input type="checkbox" id="filterFechaRealChk" checked> Fecha Realización <input type="date" id="filterFechaReal"></label>
            <label><input type="checkbox" id="filterHoraChk" checked> Hora <input type="time" id="filterHora"></label>
            <label><input type="checkbox" id="filterFechaEstChk" checked> Fecha Estimada <input type="date" id="filterFechaEst"></label>
            <label><input type="checkbox" id="filterPrioridadChk" checked> Prioridad <input type="number" id="filterPrioridad" placeholder="Prioridad"></label>
            <label>Ordenar por
              <select id="orderBy">
                <option value="fechaRealizacion">Fecha Realización (desc)</option>
                <option value="prioridad">Prioridad (desc)</option>
                <option value="hora">Hora (desc)</option>
              </select>
            </label>
            <button id="clearFilters">Limpiar Filtros</button>
          </div>
          <div class="info-container">
          <table>
            <thead>
              <tr>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Tipo de Atención</th>
                <th>Fecha Realización</th>
                  <th>Hora</th>
                <th>Fecha Estimada</th>
                <th>Prioridad</th>
              </tr>
            </thead>
              <tbody id="waitingListTableBody"></tbody>
          </table>
          <div class="action-buttons">
            <button onclick="showWaitingListForm('add')">Agregar</button>
            <button onclick="showWaitingListForm('edit')">Modificar</button>
            <button onclick="deleteWaitingListEntry()">Eliminar</button>
            </div>
            <div id="noDataMsg"></div>
          </div>
        `;
        function renderTable(data) {
          const tbody = document.getElementById('waitingListTableBody');
          tbody.innerHTML = data.map(entry => `
            <tr onclick="selectRow(this)">
              <td>${entry.patientRut || entry.rut}</td>
              <td>${entry.patientName || `${entry.nombre} ${entry.apellido}`}</td>
              <td>${entry.attentionType || entry.tipoAtencion}</td>
              <td>${entry.realizationDate || entry.fechaRealizacion}</td>
              <td>${entry.hour || entry.hora || ''}</td>
              <td>${entry.estimatedDate || entry.fechaEstimada}</td>
              <td>${((entry.priority !== undefined ? entry.priority : entry.prioridad) ? Number(entry.priority !== undefined ? entry.priority : entry.prioridad).toFixed(2) : '0.00')}%</td>
            </tr>
          `).join('');
          document.getElementById('noDataMsg').innerHTML = data.length === 0 ? '<p class="no-data">No hay registros en la lista de espera.</p>' : '';
        }
        function applyFiltersAndSort() {
          let filtered = [...waitingList];
          if (document.getElementById('filterRutChk').checked) {
            const val = document.getElementById('filterRut').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(e) { return ((e.patientRut || e.rut || '').toLowerCase().includes(val)); });
          }
          if (document.getElementById('filterNombreChk').checked) {
            const val = document.getElementById('filterNombre').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(e) { return ((e.patientName || (e.nombre ? e.nombre : '') + ' ' + (e.apellido ? e.apellido : '') || '').toLowerCase().includes(val)); });
          }
          if (document.getElementById('filterTipoChk').checked) {
            const val = document.getElementById('filterTipo').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(e) { return ((e.attentionType || e.tipoAtencion || '').toLowerCase().includes(val)); });
          }
          if (document.getElementById('filterFechaRealChk').checked) {
            const val = document.getElementById('filterFechaReal').value;
            if (val) filtered = filtered.filter(e => (e.realizationDate || e.fechaRealizacion) === val);
          }
          if (document.getElementById('filterHoraChk').checked) {
            const val = document.getElementById('filterHora').value;
            if (val) filtered = filtered.filter(e => (e.hour || e.hora) === val);
          }
          if (document.getElementById('filterFechaEstChk').checked) {
            const val = document.getElementById('filterFechaEst').value;
            if (val) filtered = filtered.filter(e => (e.estimatedDate || e.fechaEstimada) === val);
          }
          if (document.getElementById('filterPrioridadChk').checked) {
            const val = document.getElementById('filterPrioridad').value;
            if (val) filtered = filtered.filter(e => Number(e.priority !== undefined ? e.priority : e.prioridad).toFixed(2) === Number(val).toFixed(2));
          }
          // Ordenar
          const orderBy = document.getElementById('orderBy').value;
          if (orderBy === 'fechaRealizacion') {
            filtered.sort((a, b) => new Date(b.realizationDate || b.fechaRealizacion) - new Date(a.realizationDate || a.fechaRealizacion));
          } else if (orderBy === 'prioridad') {
            filtered.sort((a, b) => (Number(b.priority !== undefined ? b.priority : b.prioridad)) - (Number(a.priority !== undefined ? a.priority : a.prioridad)));
          } else if (orderBy === 'hora') {
            filtered.sort((a, b) => {
              const hA = (a.hour || a.hora || '00:00').replace(':','');
              const hB = (b.hour || b.hora || '00:00').replace(':','');
              return Number(hB) - Number(hA);
            });
          }
          renderTable(filtered);
        }
        [
          'filterRut', 'filterNombre', 'filterTipo', 'filterFechaReal', 'filterHora', 'filterFechaEst', 'filterPrioridad',
          'filterRutChk', 'filterNombreChk', 'filterTipoChk', 'filterFechaRealChk', 'filterHoraChk', 'filterFechaEstChk', 'filterPrioridadChk',
          'orderBy'
        ].forEach(id => {
          document.getElementById(id).addEventListener('input', applyFiltersAndSort);
          document.getElementById(id).addEventListener('change', applyFiltersAndSort);
        });
        document.getElementById('clearFilters').onclick = function() {
          ['filterRut','filterNombre','filterTipo','filterFechaReal','filterHora','filterFechaEst','filterPrioridad'].forEach(id => {
            document.getElementById(id).value = '';
            document.getElementById(id+'Chk').checked = false;
          });
          document.getElementById('orderBy').value = 'fechaRealizacion';
          applyFiltersAndSort();
        };
        // Render inicial
        renderTable(waitingList);
      }

      function showPatientManagement() {
        const content = document.getElementById('content');
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        content.innerHTML = `
          <h1>Gestión de Pacientes</h1>
          <div class="filter-bar">
            <label><input type="checkbox" id="filterRUTChk" checked> RUT <input type="text" id="filterRUT" placeholder="RUT"></label>
            <label><input type="checkbox" id="filterNombreChk" checked> Nombre <input type="text" id="filterNombre" placeholder="Nombre"></label>
            <label><input type="checkbox" id="filterApellidoChk" checked> Apellido <input type="text" id="filterApellido" placeholder="Apellido"></label>
            <label><input type="checkbox" id="filterCiudadChk" checked> Ciudad <input type="text" id="filterCiudad" placeholder="Ciudad"></label>
            <label><input type="checkbox" id="filterEdadChk" checked> Edad <input type="number" id="filterEdad" placeholder="Edad"></label>
            <label>Ordenar por
              <select id="orderByPacientes">
                <option value="nombreAZ">Nombre (A-Z)</option>
                <option value="nombreZA">Nombre (Z-A)</option>
                <option value="apellidoAZ">Apellido (A-Z)</option>
                <option value="apellidoZA">Apellido (Z-A)</option>
                <option value="edadAsc">Edad (Asc)</option>
                <option value="edadDesc">Edad (Desc)</option>
              </select>
            </label>
            <button id="clearFiltersPacientes">Limpiar Filtros</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Edad</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Ciudad</th>
              </tr>
            </thead>
            <tbody id="patientsTableBody"></tbody>
          </table>
          <div class="action-buttons">
            <button onclick="showPatientForm('add')">Agregar</button>
            <button onclick="showPatientForm('edit')">Modificar</button>
            <button onclick="deletePatient()">Eliminar</button>
            <button onclick="viewPatientDetails()">Ver más</button>
          </div>
          <div id="noDataMsgPacientes"></div>
        `;
        function renderTable(data) {
          const tbody = document.getElementById('patientsTableBody');
          tbody.innerHTML = data.map(patient => `
            <tr onclick="selectRow(this)">
              <td>${patient.rut}</td>
              <td>${patient.name || patient.nombre}</td>
              <td>${patient.lastName || patient.apellido}</td>
              <td>${patient.age || patient.edad}</td>
              <td>${patient.email || patient.correo}</td>
              <td>${patient.phone || patient.telefono}</td>
              <td>${patient.address || patient.direccion}</td>
              <td>${patient.city || patient.ciudad}</td>
            </tr>
          `).join('');
          document.getElementById('noDataMsgPacientes').innerHTML = data.length === 0 ? '<p class="no-data">No hay pacientes registrados.</p>' : '';
        }
        function applyFiltersAndSortPacientes() {
          let filtered = [...patients];
          if (document.getElementById('filterRUTChk').checked) {
            const val = document.getElementById('filterRUT').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(p) { return (p.rut || '').toLowerCase().includes(val); });
          }
          if (document.getElementById('filterNombreChk').checked) {
            const val = document.getElementById('filterNombre').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(p) { return ((p.name || p.nombre || '').toLowerCase().includes(val)); });
          }
          if (document.getElementById('filterApellidoChk').checked) {
            const val = document.getElementById('filterApellido').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(p) { return ((p.lastName || p.apellido || '').toLowerCase().includes(val)); });
          }
          if (document.getElementById('filterCiudadChk').checked) {
            const val = document.getElementById('filterCiudad').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(p) { return ((p.city || p.ciudad || '').toLowerCase().includes(val)); });
          }
          if (document.getElementById('filterEdadChk').checked) {
            const val = document.getElementById('filterEdad').value;
            if (val) filtered = filtered.filter(function(p) { return String(p.age || p.edad) === String(val); });
          }
          // Ordenar
          const orderBy = document.getElementById('orderByPacientes').value;
          if (orderBy === 'nombreAZ') {
            filtered.sort((a, b) => ((a.name || a.nombre || '').localeCompare(b.name || b.nombre || '')));
          } else if (orderBy === 'nombreZA') {
            filtered.sort((a, b) => ((b.name || b.nombre || '').localeCompare(a.name || a.nombre || '')));
          } else if (orderBy === 'apellidoAZ') {
            filtered.sort((a, b) => ((a.lastName || a.apellido || '').localeCompare(b.lastName || b.apellido || '')));
          } else if (orderBy === 'apellidoZA') {
            filtered.sort((a, b) => ((b.lastName || b.apellido || '').localeCompare(a.lastName || a.apellido || '')));
          } else if (orderBy === 'edadAsc') {
            filtered.sort((a, b) => (Number(a.age || a.edad) - Number(b.age || b.edad)));
          } else if (orderBy === 'edadDesc') {
            filtered.sort((a, b) => (Number(b.age || b.edad) - Number(a.age || a.edad)));
          }
          renderTable(filtered);
        }
        [
          'filterRUT', 'filterNombre', 'filterApellido', 'filterCiudad', 'filterEdad',
          'filterRUTChk', 'filterNombreChk', 'filterApellidoChk', 'filterCiudadChk', 'filterEdadChk',
          'orderByPacientes'
        ].forEach(id => {
          document.getElementById(id).addEventListener('input', applyFiltersAndSortPacientes);
          document.getElementById(id).addEventListener('change', applyFiltersAndSortPacientes);
        });
        document.getElementById('clearFiltersPacientes').onclick = function() {
          ['filterRUT','filterNombre','filterApellido','filterCiudad','filterEdad'].forEach(id => {
            document.getElementById(id).value = '';
            document.getElementById(id+'Chk').checked = false;
          });
          document.getElementById('orderByPacientes').value = 'nombreAZ';
          applyFiltersAndSortPacientes();
        };
        // Render inicial
        renderTable(patients);
      }

      function showAppointmentManagement() {
        const content = document.getElementById('content');
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        content.innerHTML = `
          <h1>Gestión de Citas</h1>
          <div class="filter-bar">
            <label><input type="checkbox" id="filterRUTCitaChk" checked> RUT <input type="text" id="filterRUTCita" placeholder="RUT"></label>
            <label><input type="checkbox" id="filterNombreCitaChk" checked> Nombre <input type="text" id="filterNombreCita" placeholder="Nombre"></label>
            <label><input type="checkbox" id="filterDoctorChk" checked> Doctor <input type="text" id="filterDoctor" placeholder="Doctor"></label>
            <label><input type="checkbox" id="filterEspecialidadChk" checked> Especialidad <input type="text" id="filterEspecialidad" placeholder="Especialidad"></label>
            <label><input type="checkbox" id="filterFechaCitaChk" checked> Fecha <input type="date" id="filterFechaCita"></label>
            <label><input type="checkbox" id="filterHoraCitaChk" checked> Hora <input type="time" id="filterHoraCita"></label>
            <label>Ordenar por
              <select id="orderByCitas">
                <option value="fecha">Fecha (desc)</option>
                <option value="hora">Hora (desc)</option>
                <option value="doctor">Doctor (A-Z)</option>
              </select>
            </label>
            <button id="clearFiltersCitas">Limpiar Filtros</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Doctor</th>
                <th>Especialidad</th>
              </tr>
            </thead>
            <tbody id="appointmentTableBody"></tbody>
          </table>
          <div class="action-buttons">
            <button onclick="showAppointmentForm('add')">Agregar</button>
            <button onclick="showAppointmentForm('edit')">Modificar</button>
            <button onclick="deleteAppointment()">Eliminar</button>
          </div>
          <div id="noDataMsgCitas"></div>
        `;
        function renderTable(data) {
          const tbody = document.getElementById('appointmentTableBody');
          tbody.innerHTML = data.map(appointment => `
            <tr onclick="selectAppointmentRow(this)">
              <td>${appointment.patientRut || appointment.rut}</td>
              <td>${appointment.patientName || `${appointment.nombre || ''} ${appointment.apellido || ''}`}</td>
              <td>${appointment.date || appointment.fecha}</td>
              <td>${appointment.time || appointment.hora}</td>
              <td>${appointment.doctor}</td>
              <td>${appointment.specialty || appointment.especialidad}</td>
            </tr>
          `).join('');
          document.getElementById('noDataMsgCitas').innerHTML = data.length === 0 ? '<p class="no-data">No hay citas agendadas.</p>' : '';
        }
        function applyFiltersAndSortCitas() {
          let filtered = [...appointments];
          if (document.getElementById('filterRUTCitaChk').checked) {
            const val = document.getElementById('filterRUTCita').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(a) { return ((a.patientRut || a.rut || '').toLowerCase().includes(val)); });
          }
          if (document.getElementById('filterNombreCitaChk').checked) {
            const val = document.getElementById('filterNombreCita').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(a) { return ((a.patientName || `${a.nombre || ''} ${a.apellido || ''}` || '').toLowerCase().includes(val)); });
          }
          if (document.getElementById('filterDoctorChk').checked) {
            const val = document.getElementById('filterDoctor').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(a) { return ((a.doctor || '').toLowerCase().includes(val)); });
          }
          if (document.getElementById('filterEspecialidadChk').checked) {
            const val = document.getElementById('filterEspecialidad').value.trim().toLowerCase();
            if (val) filtered = filtered.filter(function(a) { return ((a.specialty || a.especialidad || '').toLowerCase().includes(val)); });
          }
          if (document.getElementById('filterFechaCitaChk').checked) {
            const val = document.getElementById('filterFechaCita').value;
            if (val) filtered = filtered.filter(function(a) { return (a.date || a.fecha) === val; });
          }
          if (document.getElementById('filterHoraCitaChk').checked) {
            const val = document.getElementById('filterHoraCita').value;
            if (val) filtered = filtered.filter(function(a) { return (a.time || a.hora) === val; });
          }
          // Ordenar
          const orderBy = document.getElementById('orderByCitas').value;
          if (orderBy === 'fecha') {
            filtered.sort((a, b) => new Date(b.date || b.fecha) - new Date(a.date || a.fecha));
          } else if (orderBy === 'hora') {
            filtered.sort((a, b) => {
              const hA = (a.time || a.hora || '00:00').replace(':','');
              const hB = (b.time || b.hora || '00:00').replace(':','');
              return Number(hB) - Number(hA);
            });
          } else if (orderBy === 'doctor') {
            filtered.sort((a, b) => (a.doctor || '').localeCompare(b.doctor || ''));
          }
          renderTable(filtered);
        }
        [
          'filterRUTCita', 'filterNombreCita', 'filterDoctor', 'filterEspecialidad', 'filterFechaCita', 'filterHoraCita',
          'filterRUTCitaChk', 'filterNombreCitaChk', 'filterDoctorChk', 'filterEspecialidadChk', 'filterFechaCitaChk', 'filterHoraCitaChk',
          'orderByCitas'
        ].forEach(id => {
          document.getElementById(id).addEventListener('input', applyFiltersAndSortCitas);
          document.getElementById(id).addEventListener('change', applyFiltersAndSortCitas);
        });
        document.getElementById('clearFiltersCitas').onclick = function() {
          ['filterRUTCita','filterNombreCita','filterDoctor','filterEspecialidad','filterFechaCita','filterHoraCita'].forEach(id => {
            document.getElementById(id).value = '';
            document.getElementById(id+'Chk').checked = false;
          });
          document.getElementById('orderByCitas').value = 'fecha';
          applyFiltersAndSortCitas();
        };
        // Render inicial
        renderTable(appointments);
      }

      function showWaitingListForm(mode) {
        // Crear el overlay si no existe
        let overlay = document.getElementById('overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'overlay';
          document.body.appendChild(overlay);
        }

        // Crear el contenedor del formulario si no existe
        let formContainer = document.getElementById('waitingListFormContainer');
        if (!formContainer) {
          formContainer = document.createElement('div');
          formContainer.id = 'waitingListFormContainer';
          formContainer.className = 'modal-form';
          document.body.appendChild(formContainer);
        }

        // Formulario simplificado
        formContainer.innerHTML = `
          <h2 id="waitingListFormTitle">${mode === 'add' ? 'Agregar a Lista de Espera' : 'Modificar Entrada de Lista de Espera'}</h2>
          <form id="waitingListForm">
            <label>RUT: <input type="text" id="formRUTLista" required /></label>
            <label>Nombre: <input type="text" id="formNombreLista" readonly /></label>
            <label>Tipo de Atención: <input type="text" id="formTipoAtencionLista" required /></label>
            <label>Fecha Realización: <input type="date" id="formFechaRealizacionLista" required /></label>
            <label>Hora: <input type="time" id="formHoraLista" required /></label>
            <label>Fecha Estimada: <input type="date" id="formFechaEstimadaLista" required /></label>
            <label>Prioridad: <input type="number" id="formPrioridadLista" readonly /></label>
            <div class="form-buttons">
              <button type="button" onclick="saveWaitingListEntry()">Guardar</button>
              <button type="button" onclick="cancelWaitingListForm()">Cancelar</button>
            </div>
          </form>
        `;

        // Autocompletar nombre y prioridad al ingresar RUT
        setTimeout(() => {
          const rutInput = document.getElementById('formRUTLista');
          const nombreInput = document.getElementById('formNombreLista');
          const prioridadInput = document.getElementById('formPrioridadLista');
          rutInput.addEventListener('input', function() {
            const patients = JSON.parse(localStorage.getItem('patients')) || [];
            const paciente = patients.find(p => p.rut === rutInput.value);
            if (paciente) {
              nombreInput.value = `${paciente.name || ''} ${paciente.lastName || ''}`.trim();
              prioridadInput.value = paciente.prioridad ? paciente.prioridad : 0;
            } else {
              nombreInput.value = '';
              prioridadInput.value = '';
            }
          });
        }, 100);

        // Mostrar el formulario y el overlay
        overlay.style.display = 'block';
        formContainer.style.display = 'block';
      }

      function cancelWaitingListForm() {
        const formContainer = document.getElementById('waitingListFormContainer');
        const overlay = document.getElementById('overlay');
        if (formContainer) {
          formContainer.style.display = 'none';
          formContainer.remove();
        }
        if (overlay) {
          overlay.style.display = 'none';
          overlay.remove();
        }
        if (selectedRow) {
          selectedRow.classList.remove('selected');
          selectedRow = null;
        }
      }

      function showAppointmentForm(mode) {
        // Crear el overlay si no existe
        let overlay = document.getElementById('overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'overlay';
          document.body.appendChild(overlay);
        }

        // Crear el contenedor del formulario si no existe
        let formContainer = document.getElementById('appointmentFormContainer');
        if (!formContainer) {
          formContainer = document.createElement('div');
          formContainer.id = 'appointmentFormContainer';
          formContainer.className = 'modal-form';
          document.body.appendChild(formContainer);
        }

        // Formulario simplificado
        formContainer.innerHTML = `
          <h2 id="appointmentFormTitle">${mode === 'add' ? 'Agregar Cita' : 'Modificar Cita'}</h2>
          <form id="appointmentForm">
            <label>RUT: <input type="text" id="formRUTCita" required /></label>
            <label>Nombre: <input type="text" id="formNombreCita" readonly /></label>
            <label>Fecha: <input type="date" id="formFechaCita" required /></label>
            <label>Hora: <input type="time" id="formHoraCita" required /></label>
            <label>Doctor: <input type="text" id="formDoctorCita" required /></label>
            <label>Especialidad: <input type="text" id="formEspecialidadCita" required /></label>
            <label>Prioridad: <input type="number" id="formPrioridadCita" readonly /></label>
            <div class="form-buttons">
              <button type="button" onclick="saveAppointment()">Guardar</button>
              <button type="button" onclick="cancelAppointmentForm()">Cancelar</button>
            </div>
          </form>
        `;

        // Autocompletar nombre y prioridad al ingresar RUT
        setTimeout(() => {
          const rutInput = document.getElementById('formRUTCita');
          const nombreInput = document.getElementById('formNombreCita');
          const prioridadInput = document.getElementById('formPrioridadCita');
          rutInput.addEventListener('input', function() {
            const patients = JSON.parse(localStorage.getItem('patients')) || [];
            const paciente = patients.find(p => p.rut === rutInput.value);
            if (paciente) {
              nombreInput.value = `${paciente.name || ''} ${paciente.lastName || ''}`.trim();
              prioridadInput.value = paciente.prioridad ? paciente.prioridad : 0;
        } else {
              nombreInput.value = '';
              prioridadInput.value = '';
            }
          });
        }, 100);

        if (mode === 'edit' && selectedAppointmentRow) {
          // Rellenar el formulario con los datos de la fila seleccionada
          const cells = selectedAppointmentRow.querySelectorAll('td');
          document.getElementById('formRUTCita').value = cells[0].textContent;
          document.getElementById('formNombreCita').value = cells[1].textContent;
          document.getElementById('formFechaCita').value = cells[2].textContent;
          document.getElementById('formHoraCita').value = cells[3].textContent;
          document.getElementById('formDoctorCita').value = cells[4].textContent;
          document.getElementById('formEspecialidadCita').value = cells[5].textContent;
          document.getElementById('formPrioridadCita').value = cells[6] ? cells[6].textContent : '';
        }

        // Mostrar el formulario y el overlay
        overlay.style.display = 'block';
        formContainer.style.display = 'block';
      }

      function cancelAppointmentForm() {
        const formContainer = document.getElementById('appointmentFormContainer');
        const overlay = document.getElementById('overlay');
        if (formContainer) {
        formContainer.style.display = 'none';
          formContainer.remove();
        }
        if (overlay) {
        overlay.style.display = 'none';
          overlay.remove();
        }
        if (selectedAppointmentRow) {
          selectedAppointmentRow.classList.remove('selected');
        selectedAppointmentRow = null;
        }
      }

      function deleteAppointment() {
        if (!selectedAppointmentRow) {
          showModalAlert('Seleccione una cita para eliminar.');
          return;
        }

        showModalConfirm('¿Está seguro de que desea eliminar esta cita?', function() {
          const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
          const index = Array.from(document.getElementById('appointmentTableBody').children).indexOf(selectedAppointmentRow);
          
          appointments.splice(index, 1);
          localStorage.setItem('appointments', JSON.stringify(appointments));
          
          loadAppointments();
          selectedAppointmentRow = null;
          
          showModalAlert('Cita eliminada correctamente.');
        }, function() {
          // No se elimina la cita
        });
      }

      function saveWaitingListEntry() {
        const formContainer = document.getElementById('waitingListFormContainer');
        const overlay = document.getElementById('overlay');

        const rut = document.getElementById('formRUTLista').value;
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const paciente = patients.find(p => p.rut === rut);
        if (!paciente) {
          showModalAlert('El RUT ingresado no corresponde a ningún paciente registrado.');
            return;
          }

        const entryData = {
          patientRut: rut,
          patientName: `${paciente.name || ''} ${paciente.lastName || ''}`.trim(),
          attentionType: document.getElementById('formTipoAtencionLista').value,
          realizationDate: document.getElementById('formFechaRealizacionLista').value,
          hour: document.getElementById('formHoraLista').value,
          estimatedDate: document.getElementById('formFechaEstimadaLista').value,
          priority: paciente.prioridad ? paciente.prioridad : 0
        };

        // Validar que todos los campos estén completos
        if (
          !entryData.patientRut ||
          !entryData.attentionType ||
          !entryData.realizationDate ||
          !entryData.estimatedDate
        ) {
          showModalAlert('Todos los campos son obligatorios.');
          return;
        }

        // Obtener lista de espera existente
        const waitingList = JSON.parse(localStorage.getItem('waitingList')) || [];

        if (!selectedRow) {
          // Agregar nueva entrada
          waitingList.push(entryData);
        } else {
          // Modificar entrada existente
          const index = Array.from(document.getElementById('waitingListTableBody').children).indexOf(selectedRow);
          waitingList[index] = entryData;
        }

        // Guardar en localStorage
        localStorage.setItem('waitingList', JSON.stringify(waitingList));

        // Actualizar la tabla
        showWaitingList();

        // Limpiar y cerrar el formulario
        document.getElementById('waitingListForm').reset();
        formContainer.style.display = 'none';
        overlay.style.display = 'none';
        selectedRow = null;

        showModalAlert(selectedRow ? 'Entrada modificada correctamente.' : 'Entrada agregada correctamente.');
      }

      function deleteWaitingListEntry() {
        if (!selectedRow) {
          showModalAlert('Seleccione una entrada para eliminar.');
          return;
        }
        showModalConfirm('¿Está seguro de que desea eliminar esta entrada?', function() {
          const waitingList = JSON.parse(localStorage.getItem('waitingList')) || [];
          const index = Array.from(document.getElementById('waitingListTableBody').children).indexOf(selectedRow);
          waitingList.splice(index, 1);
          localStorage.setItem('waitingList', JSON.stringify(waitingList));
          showWaitingList();
          selectedRow = null;
          showModalAlert('Entrada eliminada correctamente.');
        }, function() {
          // No se elimina la entrada
        });
      }

      function showStatisticsReport() {
        const content = document.getElementById('content');
        content.innerHTML = `
          <h1>Reporte Estadístico</h1>
          <div class="statistics-container">
            <form id="statisticsForm" class="statistics-form">
              <h3>Información del Paciente</h3>
              <label>Nombre del Paciente: <input type="text" id="patientName" required /></label>
              <label>RUT: <input type="text" id="patientRUT" required /></label>
              
              <h3>Proceso Terapéutico</h3>
              <label>Kinésico (%): <input type="number" id="kinesico" min="0" max="100" required /></label>
              <label>T.O (%): <input type="number" id="to" min="0" max="100" required /></label>
              <label>Índice de Independencia (%): <input type="number" id="independencia" min="0" max="100" required /></label>
              <label>Escala Amputación (%): <input type="number" id="amputacion" min="0" max="100" required /></label>
              
              <div class="statistics-buttons">
                <button type="button" onclick="calculatePriority()">Calcular</button>
                <button type="button" onclick="resetStatistics()">Reiniciar</button>
              </div>
            </form>

            <div class="charts-container">
              <div class="chart">
                <h4>Kinésico</h4>
                <div id="kinesicoChart" class="circle-chart" data-value="0%"><span>0%</span></div>
              </div>
              <div class="chart">
                <h4>T.O</h4>
                <div id="toChart" class="circle-chart" data-value="0%"><span>0%</span></div>
              </div>
              <div class="chart">
                <h4>Índice de Independencia</h4>
                <div id="independenciaChart" class="circle-chart" data-value="0%"><span>0%</span></div>
              </div>
              <div class="chart">
                <h4>Escala Amputación</h4>
                <div id="amputacionChart" class="circle-chart" data-value="0%"><span>0%</span></div>
              </div>
            </div>

            <div class="priority-section">
              <h3>Prioridad Total</h3>
              <div id="priorityResult" class="priority-bar" data-value="0%"><span>0%</span></div>
            </div>
          </div>
        `;
      }

      function calculatePriority() {
        // Obtener los valores ingresados
        const kinesico = parseFloat(document.getElementById('kinesico').value) || 0;
        const to = parseFloat(document.getElementById('to').value) || 0;
        const independencia = parseFloat(document.getElementById('independencia').value) || 0;
        const amputacion = parseFloat(document.getElementById('amputacion').value) || 0;
        const rut = document.getElementById('patientRUT').value;

        // Validar que los valores estén entre 0 y 100
        if (
          kinesico < 0 || kinesico > 100 ||
          to < 0 || to > 100 ||
          independencia < 0 || independencia > 100 ||
          amputacion < 0 || amputacion > 100
        ) {
          showModalAlert('Todos los valores deben estar entre 0 y 100.');
          return;
        }

        // Calcular la prioridad
        const priority = (kinesico * 0.4) + (to * 0.3) + (independencia * 0.2) + (amputacion * 0.1);

        // Actualizar los datos del paciente
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patientIndex = patients.findIndex(p => p.rut === rut);
        
        if (patientIndex !== -1) {
          // Actualizar los datos estadísticos del paciente
          patients[patientIndex] = {
            ...patients[patientIndex],
            procesoKinesico: kinesico,
            to: to,
            indiceIndependencia: independencia,
            escalaAmputacion: amputacion,
            prioridad: priority
          };
          
          // Guardar los datos actualizados
          localStorage.setItem('patients', JSON.stringify(patients));

          // Mostrar el resultado
          const priorityResult = document.getElementById('priorityResult');
          priorityResult.setAttribute('data-value', `${priority.toFixed(2)}%`);
          let span = priorityResult.querySelector('span');
          if (!span) {
            span = document.createElement('span');
            priorityResult.appendChild(span);
          }
          span.textContent = `${priority.toFixed(2)}%`;

          // Actualizar gráficos
          updateChart('kinesicoChart', kinesico);
          updateChart('toChart', to);
          updateChart('independenciaChart', independencia);
          updateChart('amputacionChart', amputacion);

          showModalAlert('Datos estadísticos guardados correctamente para el paciente.');
        } else {
          showModalAlert('No se encontró un paciente con el RUT ingresado. Por favor, verifique el RUT.');
        }

        updatePriorityBar(priority);
      }

      function resetStatistics() {
        // Limpiar el formulario
        document.getElementById('statisticsForm').reset();

        // Reiniciar los gráficos
        ['kinesicoChart','toChart','independenciaChart','amputacionChart'].forEach(id => {
          updateChart(id, 0);
        });
        updatePriorityBar(0);
      }

      function updateChart(chartId, value) {
        const chart = document.getElementById(chartId);
        if (!chart) return;
        // Forzar el valor entre 0 y 100
        let percent = Math.max(0, Math.min(100, parseFloat(value)));
        chart.style.setProperty('--percentage', percent);
        chart.setAttribute('data-value', `${percent.toFixed(2)}%`);
        let span = chart.querySelector('span');
        if (!span) {
          span = document.createElement('span');
          chart.appendChild(span);
        }
        span.textContent = `${percent.toFixed(2)}%`;
      }

      function updatePriorityBar(value) {
        const bar = document.getElementById('priorityResult');
        if (!bar) return;
        let percent = Math.max(0, Math.min(100, parseFloat(value)));
        bar.style.setProperty('--percentage', percent + '%');
        bar.setAttribute('data-value', `${percent.toFixed(2)}%`);
        let span = bar.querySelector('span');
        if (!span) {
          span = document.createElement('span');
          bar.appendChild(span);
        }
        span.textContent = `${percent.toFixed(2)}%`;
      }

      function showProfile() {
        const content = document.getElementById('content');
        const userData = JSON.parse(localStorage.getItem('userData')) || {
          nombre: 'Juanito Perez',
          imagen: 'https://via.placeholder.com/80',
          password: '********'
        };

        content.innerHTML = `
          <h1>Mi Perfil</h1>
          <div class="profile-container">
            <div class="profile-image">
              <img src="${userData.imagen}" alt="Foto de perfil" id="profileImage" />
              <button onclick="changeProfileImage()">Cambiar imagen</button>
            </div>
            <div class="profile-info">
              <form id="profileForm">
                <label>Nombre: <input type="text" id="profileName" value="${userData.nombre}" required /></label>
                <label>Contraseña: <input type="password" id="profilePassword" value="********" required /></label>
                <button type="button" onclick="saveProfile()">Guardar cambios</button>
              </form>
            </div>
          </div>
        `;
      }

      function changeProfileImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
              // Obtener los datos actuales del usuario
              const userData = JSON.parse(localStorage.getItem('userData')) || {};
              // Actualizar la imagen
              userData.imagen = event.target.result;
              // Guardar en localStorage
              localStorage.setItem('userData', JSON.stringify(userData));
              
              // Actualizar todas las imágenes en la página
              document.getElementById('profileImage').src = event.target.result;
              document.querySelector('.sidebar img').src = event.target.result;
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }

      function saveProfile() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        userData.nombre = document.getElementById('profileName').value;
        const newPassword = document.getElementById('profilePassword').value;
        
        // Solo actualizar la contraseña si se ha modificado
        if (newPassword !== '********') {
          userData.password = newPassword;
        }
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Actualizar el nombre en la barra lateral
        document.querySelector('.sidebar h2').textContent = userData.nombre;
        
        showModalAlert('Perfil actualizado correctamente');
      }

      function cancelPatientForm() {
        const formContainer = document.getElementById('patientFormContainer');
        const overlay = document.getElementById('overlay');
        
        if (formContainer) {
          formContainer.style.display = 'none';
          formContainer.remove();
        }
        
        if (overlay) {
          overlay.style.display = 'none';
          overlay.remove();
        }

        // Deseleccionar la fila si hay una seleccionada
        if (selectedRow) {
          selectedRow.classList.remove('selected');
          selectedRow = null;
        }
      }

      function loadPatients() {
        const activeUser = localStorage.getItem('activeUser');
        if (!activeUser) {
          showModalAlert('Debe iniciar sesión para ver esta información');
          return;
        }

        const tbody = document.querySelector('#patientsTable');
        if (!tbody) {
          console.error('No se encontró la tabla de pacientes');
          return;
        }

        tbody.innerHTML = '';
        
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        console.log('Pacientes cargados:', patients);
        
        patients.forEach(patient => {
          const row = tbody.insertRow();
          row.onclick = () => selectRow(row);
          
          row.insertCell().textContent = patient.rut;
          row.insertCell().textContent = patient.name || patient.nombre;
          row.insertCell().textContent = patient.lastName || patient.apellido;
          row.insertCell().textContent = patient.age || patient.edad;
          row.insertCell().textContent = patient.email || patient.correo;
          row.insertCell().textContent = patient.phone || patient.telefono;
          row.insertCell().textContent = patient.address || patient.direccion;
          row.insertCell().textContent = patient.city || patient.ciudad;

          // Agregar los datos adicionales como atributos data-*
          row.dataset.sex = patient.sex || patient.sexo || '';
          row.dataset.birthDate = patient.birthDate || patient.fechaNacimiento || '';
          row.dataset.diagnosis = patient.diagnosis || patient.diagnostico || '';
          row.dataset.procesoKinesico = patient.procesoKinesico || 0;
          row.dataset.to = patient.to || 0;
          row.dataset.indiceIndependencia = patient.indiceIndependencia || 0;
          row.dataset.escalaAmputacion = patient.escalaAmputacion || 0;
          row.dataset.prioridad = patient.prioridad || 0;
        });
      }

      function loadAppointments() {
        const activeUser = localStorage.getItem('activeUser');
        if (!activeUser) {
          showModalAlert('Debe iniciar sesión para ver esta información');
          return;
        }

        const tbody = document.getElementById('appointmentTableBody');
        if (!tbody) {
          console.error('No se encontró la tabla de citas');
          return;
        }

        tbody.innerHTML = '';
        
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        console.log('Citas cargadas:', appointments); // Debug
        
        appointments.forEach(appointment => {
          const row = tbody.insertRow();
          row.onclick = () => selectAppointmentRow(row);
          
          row.insertCell().textContent = appointment.patientRut || appointment.rut;
          row.insertCell().textContent = appointment.patientName || `${appointment.nombre} ${appointment.apellido}`;
          row.insertCell().textContent = appointment.date || appointment.fecha;
          row.insertCell().textContent = appointment.time || appointment.hora;
          row.insertCell().textContent = appointment.doctor;
          row.insertCell().textContent = appointment.specialty || appointment.especialidad;
        });
      }

      function selectAppointmentRow(row) {
        // Si la fila clickeada es la misma que ya estaba seleccionada
        if (selectedAppointmentRow === row) {
          row.classList.remove('selected');
          selectedAppointmentRow = null;
          return;
        }

        // Deseleccionar la fila anterior si existe
        if (selectedAppointmentRow) {
          selectedAppointmentRow.classList.remove('selected');
        }

        // Seleccionar la nueva fila
        row.classList.add('selected');
        selectedAppointmentRow = row;
      }

      // Asegurarse de que las tablas se carguen al iniciar la página
      window.addEventListener('load', function() {
        // Cargar datos del usuario
        const activeUser = localStorage.getItem('activeUser');
        if (!activeUser) {
          return;
        }

        // Determinar qué tabla está visible y cargarla
        const content = document.getElementById('content');
        if (content.querySelector('#patientsTable')) {
          loadPatients();
        } else if (content.querySelector('#appointmentTableBody')) {
          loadAppointments();
        } else if (content.querySelector('#waitingListTableBody')) {
          showWaitingList();
        }
      });

      // Al inicio del archivo, después de las variables globales
      window.onload = function() {
        // Cargar datos del usuario al iniciar
        const userData = JSON.parse(localStorage.getItem('userData')) || {
          nombre: 'Juanito Perez',
          imagen: 'https://via.placeholder.com/80'
        };
        
        // Actualizar la imagen en la barra lateral
        const sidebarImg = document.querySelector('.sidebar img');
        if (sidebarImg && userData.imagen) {
          sidebarImg.src = userData.imagen;
        }
        
        // Actualizar el nombre en la barra lateral
        const sidebarName = document.querySelector('.sidebar h2');
        if (sidebarName && userData.nombre) {
          sidebarName.textContent = userData.nombre;
        }
      };

      // Modificar saveAppointment para guardar prioridad del paciente
      function saveAppointment() {
        const formContainer = document.getElementById('appointmentFormContainer');
        const overlay = document.getElementById('overlay');

        const rut = document.getElementById('formRUTCita').value;
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const paciente = patients.find(p => p.rut === rut);
        if (!paciente) {
          showModalAlert('El RUT ingresado no corresponde a ningún paciente registrado.');
          return;
        }

        const appointmentData = {
          patientRut: rut,
          patientName: `${paciente.name || ''} ${paciente.lastName || ''}`.trim(),
          date: document.getElementById('formFechaCita').value,
          time: document.getElementById('formHoraCita').value,
          doctor: document.getElementById('formDoctorCita').value,
          specialty: document.getElementById('formEspecialidadCita').value,
          priority: paciente.prioridad ? paciente.prioridad : 0
        };

        // Validar que todos los campos estén completos
        if (
          !appointmentData.patientRut ||
          !appointmentData.date ||
          !appointmentData.time ||
          !appointmentData.doctor ||
          !appointmentData.specialty
        ) {
          showModalAlert('Todos los campos son obligatorios.');
          return;
        }

        // Obtener citas existentes
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

        if (!selectedAppointmentRow) {
          // Agregar nueva cita
          appointments.push(appointmentData);
        } else {
          // Modificar cita existente
          const index = Array.from(document.getElementById('appointmentTableBody').children).indexOf(selectedAppointmentRow);
          appointments[index] = appointmentData;
        }

        // Guardar en localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Actualizar la tabla
        loadAppointments();

        // Limpiar y cerrar el formulario
        document.getElementById('appointmentForm').reset();
        formContainer.style.display = 'none';
        overlay.style.display = 'none';
        selectedAppointmentRow = null;

        showModalAlert(selectedAppointmentRow ? 'Cita modificada correctamente.' : 'Cita agregada correctamente.');
      }

      // Modal genérico para alertas y confirmaciones
      function showModalAlert(message, callback) {
        let modal = document.getElementById('customModal');
        if (!modal) {
          modal = document.createElement('div');
          modal.id = 'customModal';
          modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
              <p id="modalMessage"></p>
              <button id="modalOk">OK</button>
            </div>
          `;
          document.body.appendChild(modal);
        }
        document.getElementById('modalMessage').textContent = message;
        modal.style.display = 'flex';
        document.getElementById('modalOk').onclick = function() {
          modal.style.display = 'none';
          if (callback) callback();
        };
      }

      function showModalConfirm(message, onYes, onNo) {
        let modal = document.getElementById('customModal');
        if (!modal) {
          modal = document.createElement('div');
          modal.id = 'customModal';
          modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
              <p id="modalMessage"></p>
              <div class="modal-buttons">
                <button id="modalYes">Sí</button>
                <button id="modalNo">No</button>
              </div>
            </div>
          `;
          document.body.appendChild(modal);
        } else {
          modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
              <p id="modalMessage"></p>
              <div class="modal-buttons">
                <button id="modalYes">Sí</button>
                <button id="modalNo">No</button>
              </div>
            </div>
          `;
        }
        document.getElementById('modalMessage').textContent = message;
        modal.style.display = 'flex';
        document.getElementById('modalYes').onclick = function() {
          modal.style.display = 'none';
          if (onYes) onYes();
        };
        document.getElementById('modalNo').onclick = function() {
          modal.style.display = 'none';
          if (onNo) onNo();
        };
      }

      // CSS para el modal (agregarlo dinámicamente si no existe)
      if (!document.getElementById('customModalStyles')) {
        const style = document.createElement('style');
        style.id = 'customModalStyles';
        style.innerHTML = `
          #customModal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: none; align-items: center; justify-content: center; z-index: 3000; }
          #customModal .modal-overlay { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); }
          #customModal .modal-content { position: relative; background: #fff; border-radius: 10px; padding: 30px 25px 20px 25px; min-width: 300px; max-width: 90vw; box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 2; text-align: center; }
          #customModal .modal-content p { margin-bottom: 20px; font-size: 1.1em; }
          #customModal .modal-content button { margin: 0 10px; padding: 8px 22px; border: none; border-radius: 6px; background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: #fff; font-size: 1em; cursor: pointer; transition: background 0.2s; }
          #customModal .modal-content button:hover { background: #2575fc; }
          #customModal .modal-buttons { display: flex; justify-content: center; gap: 20px; }
        `;
        document.head.appendChild(style);
      }

      function deletePatient() {
        if (!selectedRow) {
          showModalAlert('Seleccione un paciente para eliminar.');
          return;
        }
        showModalConfirm('¿Está seguro de que desea eliminar este paciente?', function() {
          const patients = JSON.parse(localStorage.getItem('patients')) || [];
          const rut = selectedRow.querySelector('td:nth-child(1)').textContent;
          const index = patients.findIndex(p => p.rut === rut);
          if (index !== -1) {
            patients.splice(index, 1);
            localStorage.setItem('patients', JSON.stringify(patients));
            loadPatients();
            selectedRow = null;
            showModalAlert('Paciente eliminado correctamente.');
          } else {
            showModalAlert('No se encontró el paciente a eliminar.');
          }
        });
      }
