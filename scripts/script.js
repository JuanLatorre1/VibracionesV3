// Función para calcular la amplitud A
function calcularAmplitud(theta0, thetaDot0, omega0) {
    return Math.sqrt(theta0 ** 2 + (thetaDot0 / omega0) ** 2);
}

// Función para calcular la fase inicial φ
function calcularFase(theta0, thetaDot0, A, omega0) {
    let phi = Math.atan2(-thetaDot0 / (omega0 * A), theta0 / A);
    
    // Corregir fase para asegurarnos de que esté en [0, 2π]
    if (phi < 0) {
        phi += 2 * Math.PI;
    }
    
    return phi;
}

// Función para calcular omega0
function calcularOmega0(m, M, L, R, g) {
    const numerador = (m * (L) / 2) + M * (L + R);
    const denominador = (m * (L ** 2) / 3) + (2 / 5) * M * (R ** 2) + M * (L + R) ** 2;
    return Math.sqrt((numerador * g) / denominador);
}

const g = 9.81;  // Gravedad

// Variables globales para la simulación del péndulo
let canvas = document.getElementById('pendulumCanvas');
let ctx = canvas.getContext('2d');
let originX = canvas.width / 2; // El punto de suspensión en el medio
let originY = 75;  // Punto de origen del péndulo
let length = 200; // Longitud del péndulo en píxeles
let time = 0;  // Tiempo inicial
let A = 0;    // Amplitud
let phi = 0;  // Fase inicial
let omega0 = 0;  // Frecuencia angular natural
let animationFrame;
let realTimeInterval;
let startTime;
let positionData = [];
let velocityData = [];
let positionChart, velocityChart;

function inicializarGraficos() {
    const positionCtx = document.getElementById('positionChart').getContext('2d');
    const velocityCtx = document.getElementById('velocityChart').getContext('2d');
    
    positionChart = new Chart(positionCtx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Posición (rad)',
                data: positionData,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                fill: true,
                parsing: false,  // Esto es importante para usar datos de tipo {x, y}
                pointRadius: 0,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { 
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'Tiempo (s)' }
                },
                y: { 
                    title: { display: true, text: 'Posición (rad)' }
                }
            }
        }
    });

    velocityChart = new Chart(velocityCtx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Velocidad (rad/s)',
                data: velocityData,
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                fill: true,
                parsing: false,  // Esto es importante para usar datos de tipo {x, y}
                pointRadius: 0,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { 
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'Tiempo (s)' }
                },
                y: { 
                    title: { display: true, text: 'Velocidad (rad/s)' }
                }
            }
        }
    });
}

// Actualizar gráficos
function actualizarGraficos() {
    
    positionChart.update();
    velocityChart.update();
}

let frameCount = 0;
const updateEveryNFrames = 10; // Actualiza cada 5 frames (ajusta según el rendimiento deseado)

// Función para actualizar y dibujar el péndulo
function actualizarPendulo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Limpiar el canvas
    
    time += 0.01;  // Incrementar el tiempo para la simulación

    // Ecuación del movimiento: θ(t) = A cos(ω₀ t + φ)
    let theta = A * Math.cos(omega0 * time + phi);  // Ángulo del péndulo
    let thetaDot = -A * omega0 * Math.sin(omega0 * time + phi);  // Derivada de θ(t)
    // Agregar datos a los gráficos
    if (frameCount % updateEveryNFrames === 0) {
        positionData.push({ x: time, y: theta });
        velocityData.push({ x: time, y: thetaDot });
        actualizarGraficos();
        
    }
    frameCount++;

    // Limitar el número de puntos en los gráficos para mantener el rendimiento
    if (positionData.length > 500) {
        positionData.shift();
        velocityData.shift();
    }
    // Calcular la posición del péndulo en (x, y)
    let x = originX + length * Math.sin(theta);
    let y = originY + length * Math.cos(theta);

    // Dibujar la cuerda del péndulo
    ctx.beginPath();
    ctx.moveTo(originX, originY);  // Punto de suspensión
    ctx.lineTo(x, y);  // Posición de la esfera
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 10;
    ctx.stroke();

    // Dibujar la esfera del péndulo
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);  // Radio de la esfera = 20 píxeles
    ctx.fillStyle = "#FF0000";
    ctx.fill();

    // Solicitar el siguiente cuadro de animación
    animationFrame = requestAnimationFrame(actualizarPendulo);
}

// Función para iniciar la simulación
function iniciarSimulacion() {
    time = 0;  // Reiniciar el tiempo
    positionData.length = 0;  // Vaciar los datos de la gráfica
    velocityData.length = 0;  // Vaciar los datos de la gráfica
    inicializarGraficos();
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);  // Detener la animación anterior si está corriendo
    }
    
    actualizarPendulo();  // Iniciar la nueva animación
    actualizarGraficos();
}


// Agregar evento al botón de simulación
document.getElementById('simulateBtn').addEventListener('click', function() {
    
    startTime = performance.now();
    let elapsedTime = 0; // Variable para el tiempo transcurrido

            // Iniciar el temporizador de tiempo real
            realTimeInterval = setInterval(() => {
                const currentTime = performance.now();
                const totalElapsed = currentTime - startTime; // Tiempo total en milisegundos
                const seconds = Math.floor(totalElapsed / 1000); // Segundos
                const milliseconds = Math.floor(totalElapsed % 1000); // Milisegundos

                document.getElementById('realTime').textContent = `${seconds}.${milliseconds.toString().padStart(3, '0')} s`;
            }, 16); // Actualizar cada 60 ms para mayor precisión

    const theta0 = parseFloat(document.getElementById('theta0').value);
    const thetaDot0 = parseFloat(document.getElementById('thetaDot0').value);
    const m = parseFloat(document.getElementById('masaBarra').value);    // Masa de la barra
    const M = parseFloat(document.getElementById('masaEsfera').value);    // Masa de la esfera
    const L = parseFloat(document.getElementById('longitudBarra').value);    // Longitud de la barra
    const R = parseFloat(document.getElementById('radioEsfera').value);  // Radio de la esfera
    omega0 = calcularOmega0(m, M, L, R, g);  // Calcular omega0

    // Calcular Amplitud (A) y Fase (φ)
    A = calcularAmplitud(theta0, thetaDot0, omega0);
    phi = calcularFase(theta0, thetaDot0, A, omega0);

    // Mostrar los resultados en la página
    document.getElementById('omegaZero').textContent = omega0.toFixed(3);
    document.getElementById('amplitude').textContent = A.toFixed(3) + ' m';
    document.getElementById('phase').textContent = phi.toFixed(3) + ' rad';


    // Iniciar la simulación visual
    iniciarSimulacion();
});