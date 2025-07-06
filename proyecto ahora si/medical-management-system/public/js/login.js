
      function togglePassword() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.querySelector('.toggle-password');
        
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          toggleButton.textContent = '👁️‍🗨️';
        } else {
          passwordInput.type = 'password';
          toggleButton.textContent = '👁️';
        }
      }

      document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Obtener usuarios del localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Buscar el usuario
        const user = users.find(u => u.username === username && u.password === password);

        // Validación de credenciales
        if (username === 'nicolas' && password === 'Nico123456') {
          if (rememberMe) {
            localStorage.setItem('session', 'admin');
          }
          localStorage.setItem('activeUser', username);
          window.location.href = 'admin.html';
        } else if (user) {
          if (rememberMe) {
            localStorage.setItem('session', 'user');
          }
          localStorage.setItem('activeUser', username);
          window.location.href = 'user.html';
        } else {
          alert('Credenciales incorrectas');
        }
      });

      // Verificar si hay una sesión activa
      window.onload = function () {
        const session = localStorage.getItem('session');
        if (session === 'admin') {
          window.location.href = 'admin.html';
        } else if (session === 'user') {
          window.location.href = 'user.html';
        }
      };

      function savePatient() {
        const activeUser = localStorage.getItem('activeUser'); // Obtener usuario activo
        if (!activeUser) {
          alert('Debe iniciar sesión para realizar esta acción.');
          return;
        }

        const patientData = {
          nombre: document.getElementById('formNombre').value,
          apellido: document.getElementById('formApellido').value,
          fechaNacimiento: document.getElementById('formFechaNacimiento').value,
          edad: document.getElementById('formEdad').value,
          sexo: document.getElementById('formSexo').value,
          rut: document.getElementById('formRUT').value,
          ciudad: document.getElementById('formCiudad').value,
          direccion: document.getElementById('formDireccion').value,
          telefono: document.getElementById('formTelefono').value,
          diagnostico: document.getElementById('formDiagnostico').value,
        };

        // Validar que todos los campos estén completos
        if (
          !patientData.nombre ||
          !patientData.apellido ||
          !patientData.fechaNacimiento ||
          !patientData.edad ||
          !patientData.sexo ||
          !patientData.rut ||
          !patientData.ciudad ||
          !patientData.direccion ||
          !patientData.telefono ||
          !patientData.diagnostico
        ) {
          alert('Todos los campos son obligatorios.');
          return;
        }

        // Obtener los pacientes existentes del usuario activo
        const patients = JSON.parse(localStorage.getItem(`patients_${activeUser}`)) || [];

        // Agregar el nuevo paciente a la lista
        patients.push(patientData);

        // Guardar la lista actualizada en localStorage
        localStorage.setItem(`patients_${activeUser}`, JSON.stringify(patients));

        // Actualizar la tabla
        loadPatients();

        alert('Paciente registrado correctamente.');
      }

      function loadPatients() {
        const activeUser = localStorage.getItem('activeUser'); // Obtener usuario activo
        if (!activeUser) {
          alert('Debe iniciar sesión para realizar esta acción.');
          return;
        }

        const tbody = document.getElementById('patientTableBody');
        tbody.innerHTML = ''; // Limpiar la tabla

        // Obtener los pacientes del usuario activo
        const patients = JSON.parse(localStorage.getItem(`patients_${activeUser}`)) || [];

        // Agregar cada paciente a la tabla
        patients.forEach((patient) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${patient.nombre}</td>
            <td>${patient.apellido}</td>
            <td>${patient.fechaNacimiento}</td>
            <td>${patient.edad}</td>
            <td>${patient.sexo}</td>
            <td>${patient.rut}</td>
            <td>${patient.ciudad}</td>
            <td>${patient.direccion}</td>
            <td>${patient.telefono}</td>
            <td>${patient.diagnostico}</td>
          `;
          tbody.appendChild(row);
        });
      }

      function deletePatient(index) {
        const activeUser = localStorage.getItem('activeUser'); // Obtener usuario activo
        if (!activeUser) {
          alert('Debe iniciar sesión para realizar esta acción.');
          return;
        }

        // Obtener los pacientes existentes del usuario activo
        const patients = JSON.parse(localStorage.getItem(`patients_${activeUser}`)) || [];

        // Eliminar el paciente en el índice especificado
        patients.splice(index, 1);

        // Guardar la lista actualizada en localStorage
        localStorage.setItem(`patients_${activeUser}`, JSON.stringify(patients));

        // Actualizar la tabla
        loadPatients();

        alert('Paciente eliminado correctamente.');
      }

      function showPatientManagement() {
        const content = document.getElementById('content');
        content.innerHTML = `
          <h1>Gestión de Pacientes</h1>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Fecha de Nacimiento</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>RUT</th>
                <th>Ciudad</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Diagnóstico</th>
              </tr>
            </thead>
            <tbody id="patientTableBody">
              <!-- Los pacientes se cargarán aquí -->
            </tbody>
          </table>
          <button onclick="showPatientForm('add')">Agregar Paciente</button>
        `;

        // Cargar los pacientes desde localStorage
        loadPatients();
      }

      function showAppointmentManagement() {
        const content = document.getElementById('content');
        content.innerHTML = `
          <h1>Gestión de Citas</h1>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Doctor</th>
                <th>Especialidad</th>
              </tr>
            </thead>
            <tbody id="appointmentTableBody">
              <!-- Las citas se cargarán aquí -->
            </tbody>
          </table>
          <button onclick="showAppointmentForm('add')">Agregar Cita</button>
        `;

        // Cargar las citas desde localStorage
        loadAppointments();
      }

      function showWaitingList() {
        const content = document.getElementById('content');
        content.innerHTML = `
          <h1>Lista de Espera</h1>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Fecha de Nacimiento</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>RUT</th>
                <th>Ciudad</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Tipo de Atención</th>
                <th>Fecha Realización</th>
                <th>Fecha Estimada</th>
              </tr>
            </thead>
            <tbody id="waitingListBody">
              <!-- La lista de espera se cargará aquí -->
            </tbody>
          </table>
          <button onclick="showWaitingListForm('add')">Agregar Entrada</button>
        `;

        // Cargar la lista de espera desde localStorage
        loadWaitingList();
      }

      function saveAppointment() {
        const activeUser = localStorage.getItem('activeUser');
        if (!activeUser) {
          alert('Debe iniciar sesión para realizar esta acción.');
          return;
        }

        const appointmentData = {
          nombre: document.getElementById('formNombreCita').value,
          apellido: document.getElementById('formApellidoCita').value,
          fecha: document.getElementById('formFechaCita').value,
          hora: document.getElementById('formHoraCita').value,
          doctor: document.getElementById('formDoctorCita').value,
          especialidad: document.getElementById('formEspecialidadCita').value,
        };

        // Validar que todos los campos estén completos
        if (
          !appointmentData.nombre ||
          !appointmentData.apellido ||
          !appointmentData.fecha ||
          !appointmentData.hora ||
          !appointmentData.doctor ||
          !appointmentData.especialidad
        ) {
          alert('Todos los campos son obligatorios.');
          return;
        }

        const appointments = JSON.parse(localStorage.getItem(`appointments_${activeUser}`)) || [];
        appointments.push(appointmentData);
        localStorage.setItem(`appointments_${activeUser}`, JSON.stringify(appointments));

        alert('Cita registrada correctamente.');
        loadAppointments();
      }

      function loadAppointments() {
        const activeUser = localStorage.getItem('activeUser');
        if (!activeUser) {
          alert('Debe iniciar sesión para realizar esta acción.');
          return;
        }

        const tbody = document.getElementById('appointmentTableBody');
        tbody.innerHTML = '';

        const appointments = JSON.parse(localStorage.getItem(`appointments_${activeUser}`)) || [];
        appointments.forEach((appointment) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${appointment.nombre}</td>
            <td>${appointment.apellido}</td>
            <td>${appointment.fecha}</td>
            <td>${appointment.hora}</td>
            <td>${appointment.doctor}</td>
            <td>${appointment.especialidad}</td>
          `;
          tbody.appendChild(row);
        });
      }

      function deleteAppointment(index) {
        // Obtener las citas de localStorage
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

        // Eliminar la cita en el índice especificado
        appointments.splice(index, 1);

        // Guardar la lista actualizada en localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));

        alert('Cita eliminada correctamente.');

        // Actualizar la tabla
        loadAppointments();
      }

      function saveWaitingListEntry() {
        const activeUser = localStorage.getItem('activeUser');
        if (!activeUser) {
          alert('Debe iniciar sesión para realizar esta acción.');
          return;
        }

        const entryData = {
          nombre: document.getElementById('formNombreLista').value,
          apellido: document.getElementById('formApellidoLista').value,
          fechaNacimiento: document.getElementById('formFechaNacimientoLista').value,
          edad: document.getElementById('formEdadLista').value,
          sexo: document.getElementById('formSexoLista').value,
          rut: document.getElementById('formRUTLista').value,
          ciudad: document.getElementById('formCiudadLista').value,
          direccion: document.getElementById('formDireccionLista').value,
          telefono: document.getElementById('formTelefonoLista').value,
          tipoAtencion: document.getElementById('formTipoAtencionLista').value,
          fechaRealizacion: document.getElementById('formFechaRealizacionLista').value,
          fechaEstimada: document.getElementById('formFechaEstimadaLista').value,
        };

        // Validar que todos los campos estén completos
        if (
          !entryData.nombre ||
          !entryData.apellido ||
          !entryData.fechaNacimiento ||
          !entryData.edad ||
          !entryData.sexo ||
          !entryData.rut ||
          !entryData.ciudad ||
          !entryData.direccion ||
          !entryData.telefono ||
          !entryData.tipoAtencion ||
          !entryData.fechaRealizacion ||
          !entryData.fechaEstimada
        ) {
          alert('Todos los campos son obligatorios.');
          return;
        }

        const waitingList = JSON.parse(localStorage.getItem(`waitingList_${activeUser}`)) || [];
        waitingList.push(entryData);
        localStorage.setItem(`waitingList_${activeUser}`, JSON.stringify(waitingList));

        alert('Entrada registrada correctamente.');
        loadWaitingList();
      }

      function loadWaitingList() {
        const activeUser = localStorage.getItem('activeUser');
        if (!activeUser) {
          alert('Debe iniciar sesión para realizar esta acción.');
          return;
        }

        const tbody = document.getElementById('waitingListBody');
        tbody.innerHTML = '';

        const waitingList = JSON.parse(localStorage.getItem(`waitingList_${activeUser}`)) || [];
        waitingList.forEach((entry) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${entry.nombre}</td>
            <td>${entry.apellido}</td>
            <td>${entry.fechaNacimiento}</td>
            <td>${entry.edad}</td>
            <td>${entry.sexo}</td>
            <td>${entry.rut}</td>
            <td>${entry.ciudad}</td>
            <td>${entry.direccion}</td>
            <td>${entry.telefono}</td>
            <td>${entry.tipoAtencion}</td>
            <td>${entry.fechaRealizacion}</td>
            <td>${entry.fechaEstimada}</td>
          `;
          tbody.appendChild(row);
        });
      }

      function deleteWaitingListEntry(index) {
        // Obtener la lista de espera de localStorage
        const waitingList = JSON.parse(localStorage.getItem('waitingList')) || [];

        // Eliminar la entrada en el índice especificado
        waitingList.splice(index, 1);

        // Guardar la lista actualizada en localStorage
        localStorage.setItem('waitingList', JSON.stringify(waitingList));

        alert('Entrada eliminada correctamente.');

        // Actualizar la tabla
        loadWaitingList();
      }
