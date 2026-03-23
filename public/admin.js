// Verificar token de autenticación y rol (redirige a login si falta/expiró/no tiene permisos)
(function() {
            function parseJwt(token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    return JSON.parse(jsonPayload);
                } catch (e) {
                    return null;
                }
            }

            function getValidPayload() {
                const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                if (!token) return null;
                const payload = parseJwt(token);
                if (!payload) return null;
                if (payload.exp) {
                    const now = Math.floor(Date.now() / 1000);
                    if (payload.exp <= now) return null;
                }
                return payload;
            }

            const payload = getValidPayload();
            if (!payload) {
                // No token o expirado
                window.location.href = 'index.html';
                return;
            }

            // Verificar rol ADMIN (acepta variantes en mayúsculas/minúsculas)
            const roleRaw = payload.rol || payload.role || payload.Rol || payload.ROL || '';
            const role = String(roleRaw).toUpperCase();
            if (!role.includes('ADMIN')) {
                // Rol no autorizado
                sessionStorage.removeItem('token');
                localStorage.removeItem('token');
                window.location.href = 'index.html';
                return;
            }
        })();

        // Referencias a los elementos del DOM
        const form = document.getElementById('newsForm');
        const titleInput = document.getElementById('postTitle');
        const contentInput = document.getElementById('postContent');
        const postsContainer = document.getElementById('postsContainer');
        const emptyState = document.getElementById('emptyState');

        // Escuchar el evento de envío del formulario
        form.addEventListener('submit', function(event) {
            // Prevenir que la página se recargue
            event.preventDefault();

            // Obtener los valores de los inputs
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();

            if (title && content) {
                // Crear el elemento de la publicación
                crearPublicacion(title, content);
                
                // Limpiar el formulario
                form.reset();
                
                // Ocultar el estado vacío si está visible
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
            }
        });

        // Función para inyectar el nuevo anuncio en el HTML
        function crearPublicacion(titulo, contenido) {
            // Obtener la fecha y hora actual
            const fechaActual = new Date();
            const fechaFormateada = fechaActual.toLocaleDateString('es-CO') + ' ' + fechaActual.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

            // Crear un contenedor para el nuevo post
            const postDiv = document.createElement('div');
            postDiv.classList.add('post-item');

            // Estructura interna del post
            postDiv.innerHTML = `
                <h3>${escapeHTML(titulo)}</h3>
                <p>${escapeHTML(contenido)}</p>
                <div class="post-meta">
                    <span>Publicado por: Admin</span>
                    <span>${fechaFormateada}</span>
                </div>
            `;

            // Insertar al principio del contenedor
            postsContainer.prepend(postDiv);
        }

        // Función de seguridad básica para prevenir inyección de HTML (XSS)
        function escapeHTML(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        // Logout + Registrar empleado
        (function() {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function() {
                    sessionStorage.removeItem('token');
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                });
            }

            const registerBtn = document.getElementById('registerEmpBtn');
            if (registerBtn) {
                registerBtn.addEventListener('click', function() {
                    window.location.href = 'registro.html';
                });
            }
        })();
