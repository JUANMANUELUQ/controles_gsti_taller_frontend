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
                window.location.href = 'index.html';
                return;
            }
        })();

        // 1. Arreglo "quemado" con las publicaciones
        const listaAnuncios = [
            {
                id: 1,
                titulo: "Actualización en los flujos de trabajo de Scrum",
                contenido: "A partir del próximo lunes, ajustaremos los tiempos de nuestras ceremonias diarias (Daily). Por favor, revisen el tablero principal para ver los nuevos horarios asignados por equipo. Es fundamental la puntualidad para no extender la reunión más de 15 minutos.",
                fecha: "18/03/2026 08:30"
            },
            {
                id: 2,
                titulo: "Nuevas directrices de gestión de incidentes (ITIL)",
                contenido: "Como parte de nuestra mejora continua en el servicio, hemos actualizado la matriz de escalamiento de incidentes. Los tickets de prioridad alta ahora requieren una validación cruzada antes de cerrarse. El documento detallado está en la intranet.",
                fecha: "15/03/2026 14:15"
            },
            {
                id: 3,
                titulo: "Mantenimiento preventivo de servidores",
                contenido: "Este fin de semana (Sábado 21 a partir de las 22:00) realizaremos una actualización de seguridad en los servidores de la base de datos principal. Habrá intermitencia en el servicio de VPN durante aproximadamente dos horas.",
                fecha: "12/03/2026 09:00"
            }
        ];

        // 2. Referencia al contenedor en el HTML
        const feedContainer = document.getElementById('feedContainer');

        // 3. Función para renderizar los anuncios
        function renderizarAnuncios() {
            // Limpiar el contenedor por si acaso
            feedContainer.innerHTML = '';

            // Recorrer el arreglo y crear el HTML para cada anuncio
            listaAnuncios.forEach(anuncio => {
                // Crear el elemento contenedor de la tarjeta
                const card = document.createElement('article');
                card.classList.add('news-card');

                // Construir la estructura interna
                card.innerHTML = `
                    <div class="news-header">
                        <h2 class="news-title">${anuncio.titulo}</h2>
                        <span class="news-date">${anuncio.fecha}</span>
                    </div>
                    <div class="news-content">${anuncio.contenido}</div>
                    <div class="news-actions">
                        <button class="btn-text" onclick="abrirComentarios(${anuncio.id})">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Comentar
                        </button>
                    </div>
                `;

                // Añadir la tarjeta al DOM
                feedContainer.appendChild(card);
            });
        }

        // 4. Función dummy (simulada) para el botón de comentar
        function abrirComentarios(idAnuncio) {
            console.log("Abriendo sección de comentarios para el anuncio con ID:", idAnuncio);
            alert("En el futuro, esto abrirá los comentarios del anuncio #" + idAnuncio);
            // Aquí iría la lógica para expandir un div con la caja de texto y comentarios anteriores
        }

        // 5. Ejecutar la función al cargar la página
        document.addEventListener('DOMContentLoaded', renderizarAnuncios);

        // Logout: borrar token y redirigir a login
        (function() {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function() {
                    sessionStorage.removeItem('token');
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                });
            }
        })();
