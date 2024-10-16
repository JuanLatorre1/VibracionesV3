// Función para calcular la amplitud estacionaria A
function calcularAmplitudEstacionaria(F0, I, omega0, omega_f, gamma) {
    const denominador = Math.sqrt((omega0 ** 2 - omega_f ** 2) ** 2 + (2 * gamma * omega_f) ** 2);
    return F0 / (I * denominador);
}

function calcularGamma(b, I) {
    return b / (2 * I);
}

// Función para calcular la fase inicial δ
function calcularFaseEstacionaria(omega0, omega_f, gamma) {
    const sinDelta = 2 * gamma * omega_f;
    const cosDelta = omega0 ** 2 - omega_f ** 2;

    let delta = Math.atan2(sinDelta, cosDelta);
    if (delta < 0) {
        delta += 2 * Math.PI;
    }
    return delta;
}

// Función para calcular omega0
function calcularOmega0(m, M, L, R, g) {
    const numerador = (m * (L) / 2) + M * (L + R);
    const denominador = (m * (L ** 2) / 3) + (2 / 5) * M * (R ** 2) + M * (L + R) ** 2;
    return Math.sqrt((numerador * g) / denominador);
}

// Función para verificar si hay resonancia
function verificarResonancia(omega0, omega_f) {
    const umbral = 0.1; // Cambia el umbral al 10%
    const diferenciaRelativa = Math.abs(omega_f - omega0) / omega0;
    return diferenciaRelativa < umbral;
}

// Variables globales
const g = 9.81;  // Gravedad
let intervalID;   // Para detener la simulación
let positionData = [];
let velocityData = [];
let positionChart, velocityChart;

// Función para inicializar las gráficas
function inicializarGraficos() {
    const ctxPos = document.getElementById('positionChart').getContext('2d');
    const ctxVel = document.getElementById('velocityChart').getContext('2d');

    positionChart = new Chart(ctxPos, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Posición (θ)',
                data: positionData,
                borderColor: 'blue',
                fill: false,
            }]
        },
        options: {
            scales: {
                x: { type: 'linear', position: 'bottom' }
            }
        }
    });

    velocityChart = new Chart(ctxVel, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Velocidad (θ˙)',
                data: velocityData,
                borderColor: 'red',
                fill: false,
            }]
        },
        options: {
            scales: {
                x: { type: 'linear', position: 'bottom' }
            }
        }
    });
}

// Función para actualizar las gráficas
function actualizarGraficos(time, theta, thetaDot) {
    const maxDataPoints = 500;
    if (positionData.length > maxDataPoints) positionData.shift();
    if (velocityData.length > maxDataPoints) velocityData.shift();

    positionData.push({ x: time, y: theta });
    velocityData.push({ x: time, y: thetaDot });

    positionChart.update();
    velocityChart.update();
}

// Función para simular el péndulo forzado
function simularPenduloForzado() {
    // Inicializar gráficas si no se han inicializado
    if (!positionChart || !velocityChart) {
        inicializarGraficos();
    }

    // Obtener los valores de los inputs
    const theta0 = parseFloat(document.getElementById('theta0').value);
    const thetaDot0 = parseFloat(document.getElementById('thetaDot0').value);
    const m = parseFloat(document.getElementById('masaBarra').value);
    const M = parseFloat(document.getElementById('masaEsfera').value);
    const L = parseFloat(document.getElementById('longitudBarra').value);
    const R = parseFloat(document.getElementById('radioEsfera').value);
    const b = parseFloat(document.getElementById('amortiguamiento').value);
    const F0 = parseFloat(document.getElementById('fuerzaExterna').value);
    const omega_f = parseFloat(document.getElementById('frecuenciaFuerza').value);
    
    const omega0 = calcularOmega0(m, M, L, R, g);
    const I = (m * (L ** 2) / 3) + (2 / 5) * M * (R ** 2) + M * (L + R) ** 2;
    const gamma = calcularGamma(b, I);

    const A = calcularAmplitudEstacionaria(F0, I, omega0, omega_f, gamma);
    const phi = calcularFaseEstacionaria(omega0, omega_f, gamma);

    // Verificar resonancia
    const hayResonancia = verificarResonancia(omega0, omega_f);
    const resultadoResonancia = hayResonancia ? "Sí" : "No";
    document.getElementById('resonanceResult').textContent = resultadoResonancia;

    // Mostrar resultados
    document.getElementById('omegaZero').textContent = omega0.toFixed(3);
    document.getElementById('amplitude').textContent = A.toFixed(3);
    document.getElementById('phase').textContent = phi.toFixed(3);
    document.getElementById('I').textContent = I.toFixed(3);

    // Iniciar la simulación
    const canvas = document.getElementById('pendulumCanvas');
    const ctx = canvas.getContext('2d');

    let time = 0;  // Tiempo inicial
    let startTime = Date.now();
    clearInterval(intervalID);

    intervalID = setInterval(function() {
        // Calcular la posición del péndulo en el tiempo (solución estacionaria)
        const theta = A * Math.cos(omega_f * time - phi);
        const thetaDot = -A * omega_f * Math.sin(omega_f * time - phi); // Calcular la velocidad

        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar el péndulo
        const x = canvas.width / 2;
        const y = 100;
        const length = 200;

        const pendulumX = x + length * Math.sin(theta);
        const pendulumY = y + length * Math.cos(theta);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(pendulumX, pendulumY);
        ctx.lineWidth = 4;  // Hacer la barra del péndulo más gruesa
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pendulumX, pendulumY, 20, 0, 2 * Math.PI);  // Esfera del péndulo
        ctx.fillStyle = 'red';
        ctx.fill();

        // Actualizar el tiempo transcurrido
        time = (Date.now() - startTime) / 1000;
        document.getElementById('timeElapsed').textContent = time.toFixed(2);

        // Actualizar gráficas
        actualizarGraficos(time, theta, thetaDot);
    }, 1000 / 60);  // Actualizar 60 veces por segundo
}

// Evento al presionar el botón de simulación
document.getElementById('simulateBtn').addEventListener('click', simularPenduloForzado);
