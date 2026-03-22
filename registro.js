// Verificar token ADMIN antes de permitir acceso a la página
        (function() {
            function parseJwt(token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    return JSON.parse(jsonPayload);
                } catch (e) { return null; }
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
            if (!payload) { window.location.href = 'login.html'; return; }
            const roleRaw = payload.rol || payload.role || payload.Rol || payload.ROL || '';
            const role = String(roleRaw).toUpperCase();
            if (!role.includes('ADMIN')) { sessionStorage.removeItem('token'); localStorage.removeItem('token'); window.location.href = 'login.html'; return; }
        })();

        const form = document.getElementById('registerForm');
        const message = document.getElementById('message');
        const submitBtn = document.getElementById('submitBtn');
        const backBtn = document.getElementById('backBtn');

        backBtn.addEventListener('click', function() { window.location.href = 'admin.html'; });

        function showMessage(text, type) {
            message.textContent = text;
            message.className = 'message ' + (type === 'error' ? 'error' : 'success');
        }

        async function registerUser(nombre, clave) {
            const url = 'http://localhost:8080/api/public/register';
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            const body = { nombre: nombre, clave: clave };

            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;

            const resp = await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) });
            return resp;
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            showMessage('', '');

            const nombre = document.getElementById('nombre').value.trim();
            const clave = document.getElementById('clave').value.trim();

            if (!nombre || !clave) { showMessage('Completa ambos campos.', 'error'); return; }

            const payloadNombre = nombre.toUpperCase();
            const payloadClave = clave.toUpperCase();

            submitBtn.disabled = true;
            try {
                const resp = await registerUser(payloadNombre, payloadClave);
                if (!resp.ok) {
                    const text = await resp.text().catch(() => 'Error en la solicitud');
                    showMessage('Error: ' + resp.status + ' - ' + text, 'error');
                    submitBtn.disabled = false;
                    return;
                }

                const data = await resp.json().catch(() => null);
                showMessage('Usuario registrado correctamente.', 'success');
                form.reset();
                submitBtn.disabled = false;
            } catch (err) {
                showMessage('No se pudo conectar al servidor.', 'error');
                submitBtn.disabled = false;
            }
        });