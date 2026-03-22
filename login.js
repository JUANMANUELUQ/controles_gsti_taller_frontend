const form = document.getElementById('loginForm');
        const errorMsg = document.getElementById('errorMessage');
        const submitButton = form.querySelector('button[type="submit"]');

        // Decodifica el payload de un JWT (maneja base64url)
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

        async function sendLoginRequest(nombre, clave) {
            const base = (window.APP_CONFIG && window.APP_CONFIG.API_URL) ? window.APP_CONFIG.API_URL : 'http://localhost:8080';
            const url = `${base}/api/public/login`;
            const body = {
                nombre: nombre,
                clave: clave
            };

            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            return resp;
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            errorMsg.style.display = 'none';

            const userInput = document.getElementById('username').value.trim();
            const passInput = document.getElementById('password').value.trim();

            if (!userInput || !passInput) {
                errorMsg.textContent = 'Completa usuario y contraseña.';
                errorMsg.style.display = 'block';
                return;
            }

            // Enviamos los valores en mayúsculas para coincidir con el ejemplo pedido
            const payloadNombre = userInput.toUpperCase();
            const payloadClave = passInput.toUpperCase();

            // Desactivar botón para evitar múltiples envíos
            submitButton.disabled = true;

            try {
                const response = await sendLoginRequest(payloadNombre, payloadClave);
                console.log('Respuesta del servidor:', response);

                if (!response.ok) {
                    errorMsg.textContent = 'Usuario o contraseña incorrectos.';
                    errorMsg.style.display = 'block';
                    submitButton.disabled = false;
                    return;
                }

                const data = await response.json();

                if (data && data.error === false && data.reply && data.reply.token) {
                    const token = data.reply.token;
                    // Guardar token
                    sessionStorage.setItem('token', token);

                    const payload = parseJwt(token);
                    const roleRaw = (payload && (payload.rol || payload.role || payload.Rol || payload.ROL)) || '';
                    const role = String(roleRaw).toUpperCase();

                    // Redireccionar según rol
                    if (role.includes('ADMIN')) {
                        window.location.href = 'admin.html';
                    } else if (role.includes('EMPLOY') || role.includes('EMPLOYEE') || role.includes('EMPLE')) {
                        window.location.href = 'empleado.html';
                    } else {
                        // Rol desconocido: ir a una ruta por defecto (empleado)
                        window.location.href = 'empleado.html';
                    }

                } else {
                    errorMsg.textContent = 'Usuario o contraseña incorrectos.';
                    errorMsg.style.display = 'block';
                    submitButton.disabled = false;
                }

            } catch (err) {
                errorMsg.textContent = 'No se pudo conectar al servidor.';
                errorMsg.style.display = 'block';
                submitButton.disabled = false;
            }
        });