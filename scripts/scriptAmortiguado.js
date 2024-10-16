// Función para calcular el momento de inercia I
function calcularMomentoInercia(m, M, L, R) {
    return (1 / 3) * m * L ** 2 + M * (L + R) ** 2 + (2 / 5) * M * R ** 2;
}

// Función para calcular gamma
function calcularGamma(b, I) {
    return b / (2 * I);
}

// Función para calcular la amplitud A
function calcularAmplitud(theta0, thetaDot0, omega_d, gamma) {
    return Math.sqrt(theta0 ** 2 + ((thetaDot0 + gamma * theta0) / omega_d) ** 2);
}

// Función para calcular la fase inicial φ
function calcularFase(theta0, thetaDot0, A, omega_d, gamma) {
    let phi = Math.atan2(-(thetaDot0 + gamma * theta0) / omega_d, theta0);

    if (phi < 0) {
        phi += 2 * Math.PI;
    }

    return phi;
}

// Función para calcular omega_d (frecuencia amortiguada)
function calcularOmegaD(omega0, gamma) {
    return Math.sqrt(omega0 ** 2 - gamma ** 2);
}

// Función para calcular omega0 (frecuencia natural no amortiguada)
function calcularOmega0(m, M, L, R, g) {
    const numerador = (m * (L) / 2) + M * (L + R);
    const denominador = (m * (L ** 2) / 3) + (2 / 5) * M * (R ** 2) + M * (L + R) ** 2;
    return Math.sqrt((numerador * g) / denominador);
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

// Función para simular el péndulo amortiguado
function simularPendulo() {
    if (!positionChart || !velocityChart) {
        inicializarGraficos();
    }

    const theta0 = parseFloat(document.getElementById('theta0').value);
    const thetaDot0 = parseFloat(document.getElementById('thetaDot0').value);
    const m = parseFloat(document.getElementById('masaBarra').value);
    const M = parseFloat(document.getElementById('masaEsfera').value);
    const L = parseFloat(document.getElementById('longitudBarra').value);
    const R = parseFloat(document.getElementById('radioEsfera').value);
    const b = parseFloat(document.getElementById('amortiguamiento').value);

    const I = calcularMomentoInercia(m, M, L, R);
    const gamma = calcularGamma(b, I);

    const omega0 = calcularOmega0(m, M, L, R, g);
    const omega_d = calcularOmegaD(omega0, gamma);

    let tipoAmortiguamiento;
    if (gamma < omega0) {
        tipoAmortiguamiento = 'subamortiguado';
    } else if (gamma > omega0) {
        tipoAmortiguamiento = 'sobreamortiguado';
    } else {
        tipoAmortiguamiento = 'critico';
    }

    let A, phi, C1, C2;

    switch (tipoAmortiguamiento) {
        case 'subamortiguado':
            A = calcularAmplitud(theta0, thetaDot0, omega_d, gamma);
            phi = calcularFase(theta0, thetaDot0, A, omega_d, gamma);
            break;
        case 'sobreamortiguado':
            const gamma1 = -gamma + Math.sqrt(gamma ** 2 - omega0 ** 2);
            const gamma2 = -gamma - Math.sqrt(gamma ** 2 - omega0 ** 2);
            C1 = theta0;
            C2 = (thetaDot0 - gamma * theta0) / (gamma1 - gamma2);
            break;
        case 'critico':
            C1 = theta0;
            C2 = thetaDot0 + gamma * theta0;
            break;
    }

    document.getElementById('tipoAmortiguamiento').textContent = tipoAmortiguamiento;
    document.getElementById('omegaZero').textContent = omega0.toFixed(3);
    document.getElementById('gamma').textContent = gamma.toFixed(3);
    document.getElementById('I').textContent = I.toFixed(3);
    
    if (tipoAmortiguamiento === 'subamortiguado') {
        document.getElementById('amplitude').textContent = A.toFixed(3);
        document.getElementById('phase').textContent = phi.toFixed(3);
        document.getElementById('simulationStatus').textContent = ''; // Limpiar mensaje
    } else {
        document.getElementById('amplitude').textContent = theta0.toFixed(3);
        document.getElementById('phase').textContent = '0';
        document.getElementById('simulationStatus').textContent = '¡Simulacion detenida!';
    }

    const canvas = document.getElementById('pendulumCanvas');
    const ctx = canvas.getContext('2d');

    let time = 0;
    let startTime = Date.now();
    clearInterval(intervalID);

    intervalID = setInterval(function () {
        let theta, thetaDot;

        if (tipoAmortiguamiento === 'subamortiguado') {
            theta = A * Math.exp(-gamma * time) * Math.cos(omega_d * time + phi);
            thetaDot = -A * Math.exp(-gamma * time) * (gamma * Math.cos(omega_d * time + phi) + omega_d * Math.sin(omega_d * time + phi));
        } else if (tipoAmortiguamiento === 'sobreamortiguado') {
            theta = C1 * Math.exp(gamma1 * time) + C2 * Math.exp(gamma2 * time);
            thetaDot = C1 * gamma1 * Math.exp(gamma1 * time) + C2 * gamma2 * Math.exp(gamma2 * time);
        } else { // caso de amortiguamiento crítico
            theta = (C1 + C2 * time) * Math.exp(-gamma * time);
            thetaDot = C2 * Math.exp(-gamma * time) * (1 - gamma * time);
        }

        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const x = canvas.width / 2;
        const y = 100;
        const length = 200;

        // Calcular la posición del péndulo
        const pendulumX = x + length * Math.sin(theta);
        const pendulumY = y + length * Math.cos(theta);

        // Dibujar la línea del péndulo
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(pendulumX, pendulumY);
        ctx.lineWidth = 10;
        ctx.stroke();

        // Dibujar la esfera del péndulo
        ctx.beginPath();
        ctx.arc(pendulumX, pendulumY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();

        // Actualizar el tiempo
        time = (Date.now() - startTime) / 1000;
        document.getElementById('timeElapsed').textContent = time.toFixed(2);
        actualizarGraficos(time, theta, thetaDot);
    }, 1000 / 60);
}


document.getElementById('simulateBtn').addEventListener('click', simularPendulo);
