      // Cargar información del usuario al iniciar
      window.onload = function() {
        const activeUser = localStorage.getItem('activeUser');
        if (!activeUser) {
          window.location.href = 'index.html';
          return;
        }

        // Obtener usuarios del localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUser = users.find(u => u.username === activeUser);
        
        if (currentUser) {
          // Obtener información del paciente
          const patients = JSON.parse(localStorage.getItem('patients')) || [];
          const patientInfo = patients.find(p => p.rut === currentUser.rut);
          
          if (patientInfo) {
            // Actualizar nombre en la barra lateral
            document.getElementById('sidebarUserName').textContent = 
              `${patientInfo.name || patientInfo.nombre || ''} ${patientInfo.lastName || patientInfo.apellido || ''}`;
            
            // Actualizar imagen de perfil si existe
            if (currentUser.profileImage) {
              document.getElementById('sidebarProfileImage').src = currentUser.profileImage;
            }
          }
        }
      };

      function logout() {
        localStorage.removeItem('session');
        localStorage.removeItem('activeUser');
        window.location.href = 'index.html';
      }

      function showWaitingList() {
        const content = document.getElementById('content');
        const activeUser = localStorage.getItem('activeUser');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUser = users.find(u => u.username === activeUser);
        if (!currentUser) {
          alert('Error al cargar la información del usuario');
          return;
        }
        const waitingList = JSON.parse(localStorage.getItem('waitingList')) || [];
        const userWaitingList = waitingList.filter(entry =>
          entry.patientRut === currentUser.rut || entry.rut === currentUser.rut
        );
        content.innerHTML = `
          <h1>Mi Lista de Espera</h1>
          <div class="info-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo de Atención</th>
                  <th>Fecha Realización</th>
                  <th>Fecha Estimada</th>
                  <th>Prioridad</th>
                </tr>
              </thead>
              <tbody>
                ${userWaitingList.map(entry => `
                  <tr>
                    <td>${entry.attentionType || entry.tipoAtencion}</td>
                    <td>${entry.realizationDate || entry.fechaRealizacion}</td>
                    <td>${entry.estimatedDate || entry.fechaEstimada}</td>
                    <td>${((entry.priority !== undefined ? entry.priority : entry.prioridad) ? Number(entry.priority !== undefined ? entry.priority : entry.prioridad).toFixed(2) : '0.00')}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${userWaitingList.length === 0 ? '<p class="no-data">No hay registros en la lista de espera.</p>' : ''}
          </div>
        `;
      }

      function showMedicalHistory() {
        const content = document.getElementById('content');
        const activeUser = localStorage.getItem('activeUser');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUser = users.find(u => u.username === activeUser);
        
        if (!currentUser) {
          alert('Error al cargar la información del usuario');
          return;
        }

        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patientInfo = patients.find(p => p.rut === currentUser.rut);

        if (!patientInfo) {
          content.innerHTML = `
            <h1>Historial Médico</h1>
            <p class="no-data">No se encontró información médica.</p>
          `;
          return;
        }

        content.innerHTML = `
          <h1>Historial Médico</h1>
          <div class="info-container">
            <div class="info-section">
              <h3>Información Personal</h3>
              <p><strong>Nombre:</strong> ${patientInfo.name || patientInfo.nombre || 'No especificado'}</p>
              <p><strong>Apellido:</strong> ${patientInfo.lastName || patientInfo.apellido || 'No especificado'}</p>
              <p><strong>RUT:</strong> ${patientInfo.rut || 'No especificado'}</p>
              <p><strong>Fecha de Nacimiento:</strong> ${patientInfo.birthDate || patientInfo.fechaNacimiento || 'No especificado'}</p>
              <p><strong>Edad:</strong> ${patientInfo.age || patientInfo.edad || 'No especificado'}</p>
              <p><strong>Sexo:</strong> ${patientInfo.sex || patientInfo.sexo || 'No especificado'}</p>
            </div>
            <div class="info-section">
              <h3>Información de Contacto</h3>
              <p><strong>Email:</strong> ${patientInfo.email || patientInfo.correo || 'No especificado'}</p>
              <p><strong>Teléfono:</strong> ${patientInfo.phone || patientInfo.telefono || 'No especificado'}</p>
              <p><strong>Dirección:</strong> ${patientInfo.address || patientInfo.direccion || 'No especificado'}</p>
              <p><strong>Ciudad:</strong> ${patientInfo.city || patientInfo.ciudad || 'No especificado'}</p>
            </div>
            <div class="info-section">
              <h3>Información Médica</h3>
              <p><strong>Diagnóstico:</strong> ${patientInfo.diagnosis || patientInfo.diagnostico || 'No especificado'}</p>
              <p><strong>Proceso Kinésico:</strong> ${patientInfo.procesoKinesico || '0'}%</p>
              <p><strong>T.O:</strong> ${patientInfo.to || '0'}%</p>
              <p><strong>Índice de Independencia Funcional:</strong> ${patientInfo.indiceIndependencia || '0'}%</p>
              <p><strong>Escala Amputación y Prótesis:</strong> ${patientInfo.escalaAmputacion || '0'}%</p>
              <p><strong>Prioridad:</strong> ${patientInfo.prioridad ? patientInfo.prioridad.toFixed(2) : '0'}%</p>
            </div>
          </div>
        `;
      }

      function showAppointments() {
        const content = document.getElementById('content');
        const activeUser = localStorage.getItem('activeUser');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUser = users.find(u => u.username === activeUser);
        
        if (!currentUser) {
          alert('Error al cargar la información del usuario');
          return;
        }

        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const userAppointments = appointments.filter(appointment => 
          appointment.patientRut === currentUser.rut || appointment.rut === currentUser.rut
        );

        content.innerHTML = `
          <h1>Mis Citas Agendadas</h1>
          <div class="info-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Doctor/Profesional</th>
                  <th>Especialidad</th>
                </tr>
              </thead>
              <tbody>
                ${userAppointments.map(appointment => `
                  <tr>
                    <td>${appointment.date || appointment.fecha}</td>
                    <td>${appointment.time || appointment.hora}</td>
                    <td>${appointment.doctor}</td>
                    <td>${appointment.specialty || appointment.especialidad}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${userAppointments.length === 0 ? '<p class="no-data">No hay citas agendadas.</p>' : ''}
          </div>
        `;
      }

      function showProfile() {
        const content = document.getElementById('content');
        const activeUser = localStorage.getItem('activeUser');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUser = users.find(u => u.username === activeUser);
        
        if (!currentUser) {
          alert('Error al cargar la información del usuario');
          return;
        }

        // Obtener información del paciente
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patientInfo = patients.find(p => p.rut === currentUser.rut);

        if (!patientInfo) {
          alert('No se encontró información del paciente');
          return;
        }

        content.innerHTML = `
          <h1>Mi Perfil</h1>
          <div class="profile-container">
            <div class="profile-image">
              <img src="${currentUser.profileImage || 'https://via.placeholder.com/150'}" alt="Foto de perfil" id="profileImage" />
              <button onclick="changeProfileImage()">Cambiar imagen</button>
            </div>
            <div class="profile-info">
              <form id="profileForm">
                <label>Nombre: <input type="text" id="profileName" value="${patientInfo.name || patientInfo.nombre || ''}" readonly /></label>
                <label>Apellido: <input type="text" id="profileLastName" value="${patientInfo.lastName || patientInfo.apellido || ''}" readonly /></label>
                <label>RUT: <input type="text" id="profileRUT" value="${patientInfo.rut || ''}" readonly /></label>
                <label>Email: <input type="email" id="profileEmail" value="${patientInfo.email || patientInfo.correo || ''}" readonly /></label>
                <label>Teléfono: <input type="text" id="profilePhone" value="${patientInfo.phone || patientInfo.telefono || ''}" readonly /></label>
                <label>Dirección: <input type="text" id="profileAddress" value="${patientInfo.address || patientInfo.direccion || ''}" readonly /></label>
                <label>Ciudad: <input type="text" id="profileCity" value="${patientInfo.city || patientInfo.ciudad || ''}" readonly /></label>
                <div class="password-section">
                  <h3>Cambiar Contraseña</h3>
                  <div class="password-input-container">
                    <label>
                      Contraseña Actual:
                      <div class="password-field">
                        <input type="password" id="currentPassword" />
                        <button type="button" onclick="togglePassword('currentPassword')" class="toggle-password">👁️</button>
                      </div>
                    </label>
                  </div>
                  <div class="password-input-container">
                    <label>
                      Nueva Contraseña:
                      <div class="password-field">
                        <input type="password" id="newPassword" />
                        <button type="button" onclick="togglePassword('newPassword')" class="toggle-password">👁️</button>
                      </div>
                    </label>
                  </div>
                  <div class="password-input-container">
                    <label>
                      Confirmar Nueva Contraseña:
                      <div class="password-field">
                        <input type="password" id="confirmPassword" />
                        <button type="button" onclick="togglePassword('confirmPassword')" class="toggle-password">👁️</button>
                      </div>
                    </label>
                  </div>
                </div>
                <button type="button" onclick="saveProfile()">Guardar cambios</button>
              </form>
            </div>
          </div>
        `;

        // Actualizar la imagen de perfil si existe
        if (currentUser.profileImage) {
          document.getElementById('profileImage').src = currentUser.profileImage;
        }
      }

      function togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const button = input.nextElementSibling;
        
        if (input.type === 'password') {
          input.type = 'text';
          button.textContent = '🔒';
        } else {
          input.type = 'password';
          button.textContent = '👁️';
        }
      }

      function saveProfile() {
        const activeUser = localStorage.getItem('activeUser');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.username === activeUser);
        
        if (userIndex === -1) {
          alert('Error: Usuario no encontrado');
          return;
        }

        // Verificar si se está intentando cambiar la contraseña
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (currentPassword || newPassword || confirmPassword) {
          // Verificar que todos los campos de contraseña estén llenos
          if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Para cambiar la contraseña, debe llenar todos los campos de contraseña');
            return;
          }
          
          // Verificar la contraseña actual
          if (users[userIndex].password !== currentPassword) {
            alert('La contraseña actual es incorrecta');
            return;
          }
          
          // Verificar que las nuevas contraseñas coincidan
          if (newPassword !== confirmPassword) {
            alert('Las nuevas contraseñas no coinciden');
            return;
          }
          
          // Actualizar la contraseña
          users[userIndex].password = newPassword;
          localStorage.setItem('users', JSON.stringify(users));
          
          // Limpiar los campos de contraseña
          document.getElementById('currentPassword').value = '';
          document.getElementById('newPassword').value = '';
          document.getElementById('confirmPassword').value = '';
          
          alert('Contraseña actualizada correctamente');
        }
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
              const activeUser = localStorage.getItem('activeUser');
              const users = JSON.parse(localStorage.getItem('users')) || [];
              const userIndex = users.findIndex(u => u.username === activeUser);
              
              if (userIndex !== -1) {
                users[userIndex].profileImage = event.target.result;
                localStorage.setItem('users', JSON.stringify(users));
                
                // Actualizar todas las imágenes en la página
                document.getElementById('profileImage').src = event.target.result;
                document.getElementById('sidebarProfileImage').src = event.target.result;
                
                alert('Imagen de perfil actualizada correctamente');
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
   