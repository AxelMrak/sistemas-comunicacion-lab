// ============================================
// SISTEMAS DE COMUNICACIÓN - APP INTERACTIVA
// ============================================

// Estado global
const state = {
    // Señal sinusoidal
    amplitude: 1,
    frequency: 1,
    phase: 0,
    
    // Tipo de señal
    signalType: 'analogica',
    
    // Perturbaciones
    perturbations: {
        atenuacion: true,
        ruido: false,
        distorsion: false,
        level: 0.5
    },
    
    // SNR
    signalPower: 10,
    noisePower: 1,
    
    // Modulación analógica
    analogMod: 'am',
    modIndex: 0.5,
    fm: 0.2,
    
    // Demodulación
    demodStage: 0,
    
    // Modulación digital
    digitalMod: 'ask',
    bits: '10110010',
    
    // Constelación
    constellation: 'bpsk',
    
    // PCM
    pcmStage: 'original',
    quantLevels: 8,
    
    // Modulación de pulsos
    pulseMod: 'pam',
    
    // Errores
    errorMethod: 'paridad',
    dataBits: [1, 0, 1, 1, 0, 0, 1, 0],
    
    // Hamming
    hammingData: [1, 0, 1, 1],
    hammingCode: [],
    hammingError: -1
};

// ============================================
// UTILIDADES
// ============================================
function $(id) { return document.getElementById(id); }

function drawGrid(ctx, width, height) {
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    
    // Líneas horizontales
    for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Líneas verticales
    for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Ejes
    ctx.strokeStyle = '#8b949e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
}

// ============================================
// SECCIÓN: SEÑAL SINUSOIDAL
// ============================================
function drawSinusoid() {
    const canvas = $('sinusoidCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    const centerY = height / 2;
    const amplitude = (height / 3) * state.amplitude;
    const frequency = state.frequency * 0.02;
    const phaseRad = state.phase * Math.PI / 180;
    
    // Dibujar señal
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
        const t = x * frequency + phaseRad;
        const y = centerY - amplitude * Math.sin(t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Indicar parámetros
    ctx.fillStyle = '#e6edf3';
    ctx.font = '14px monospace';
    ctx.fillText(`Amplitud: ${state.amplitude.toFixed(1)}`, 10, 25);
    ctx.fillText(`Frecuencia: ${state.frequency} Hz`, 10, 45);
    ctx.fillText(`Fase: ${state.phase}°`, 10, 65);
    ctx.fillText(`Período: ${(1/state.frequency).toFixed(2)} s`, 10, 85);
}

function updateSinusoidControls() {
    const amp = $('amplitude');
    const freq = $('frequency');
    const phase = $('phase');
    
    if (amp) {
        amp.addEventListener('input', (e) => {
            state.amplitude = parseFloat(e.target.value);
            $('ampVal').textContent = state.amplitude.toFixed(1);
            drawSinusoid();
        });
    }
    
    if (freq) {
        freq.addEventListener('input', (e) => {
            state.frequency = parseFloat(e.target.value);
            $('freqVal').textContent = state.frequency;
            drawSinusoid();
        });
    }
    
    if (phase) {
        phase.addEventListener('input', (e) => {
            state.phase = parseInt(e.target.value);
            $('phaseVal').textContent = state.phase;
            drawSinusoid();
        });
    }
}

// ============================================
// SECCIÓN: TIPOS DE SEÑALES
// ============================================
function showSignalType(type) {
    state.signalType = type;
    document.querySelectorAll('#senal .toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const info = {
        analogica: '<strong>Señal Analógica:</strong> Toma infinitos valores. Continua en tiempo y amplitud. Ejemplo: voz natural, música. Susceptible al ruido (no se puede regenerar).',
        digital: '<strong>Señal Digital:</strong> Valores discretos (0 y 1). Resistente al ruido (se puede regenerar). Requiere PCM. Usada en sistemas modernos.',
        periodica: '<strong>Señal Periódica:</strong> Se repite a intervalos iguales. f(t) = f(t+T). Ejemplo: sinusoidal pura.',
        noperiodica: '<strong>Señal No Periódica:</strong> No repite su forma. Ejemplo: pulso único, ruido térmico, señal de voz completa.'
    };
    
    $('signalInfo').innerHTML = info[type];
    drawSignalType();
}

function drawSignalType() {
    const canvas = $('signalTypeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    const centerY = height / 2;
    ctx.lineWidth = 3;
    
    switch(state.signalType) {
        case 'analogica':
            // Onda analógica compleja
            ctx.strokeStyle = '#00bcd4';
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const t = x * 0.03;
                const y = centerY - 60 * Math.sin(t) - 30 * Math.sin(t * 2.5);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            break;
            
        case 'digital':
            // Onda digital
            ctx.strokeStyle = '#ff5722';
            ctx.beginPath();
            const bitWidth = width / 16;
            for (let i = 0; i < 16; i++) {
                const bit = Math.random() > 0.5 ? 1 : 0;
                const y = bit ? centerY - 50 : centerY + 50;
                ctx.lineTo(i * bitWidth, y);
                ctx.lineTo((i + 1) * bitWidth, y);
            }
            ctx.stroke();
            break;
            
        case 'periodica':
            // Sinusoide pura
            ctx.strokeStyle = '#4caf50';
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const y = centerY - 60 * Math.sin(x * 0.05);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            break;
            
        case 'noperiodica':
            // Pulso único
            ctx.strokeStyle = '#ff9800';
            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                let y = centerY;
                if (x > width * 0.3 && x < width * 0.5) {
                    y = centerY - 80 * Math.exp(-Math.pow((x - width * 0.4) / 30, 2));
                }
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            break;
    }
}

// ============================================
// SECCIÓN: PERTURBACIONES
// ============================================
function drawPerturbations() {
    const canvas = $('perturbationCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    const centerY = height / 2;
    const level = state.perturbations.level;
    
    // Señal original
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        const y = centerY - 60 * Math.sin(x * 0.04);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Señal afectada
    ctx.strokeStyle = '#ff5722';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
        let y = centerY - 60 * Math.sin(x * 0.04);
        
        if (state.perturbations.atenuacion) {
            const attenuation = 1 - (x / width) * level * 0.8;
            y = centerY - 60 * attenuation * Math.sin(x * 0.04);
        }
        
        if (state.perturbations.ruido) {
            y += (Math.random() - 0.5) * 40 * level;
        }
        
        if (state.perturbations.distorsion) {
            y = centerY - 60 * Math.sin(x * 0.04 + level * 0.5 * Math.sin(x * 0.01));
        }
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function updatePerturbationControls() {
    const atenuacion = $('showAtenuacion');
    const ruido = $('showRuido');
    const distorsion = $('showDistorsion');
    const level = $('effectLevelInput');
    
    function update() {
        state.perturbations.atenuacion = atenuacion?.checked || false;
        state.perturbations.ruido = ruido?.checked || false;
        state.perturbations.distorsion = distorsion?.checked || false;
        state.perturbations.level = level ? parseInt(level.value) / 100 : 0.5;
        if ($('effectLevel')) $('effectLevel').textContent = Math.round(state.perturbations.level * 100);
        drawPerturbations();
    }
    
    if (atenuacion) atenuacion.addEventListener('change', update);
    if (ruido) ruido.addEventListener('change', update);
    if (distorsion) distorsion.addEventListener('change', update);
    if (level) level.addEventListener('input', update);
}

// ============================================
// SECCIÓN: SNR
// ============================================
function drawSNR() {
    const canvas = $('snrCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    const centerY = height / 2;
    const signalAmp = Math.min(state.signalPower * 5, 80);
    const noiseAmp = state.noisePower * 15;
    
    // Dibujar señal con ruido
    ctx.strokeStyle = '#ff5722';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
        const signal = signalAmp * Math.sin(x * 0.04);
        const noise = (Math.random() - 0.5) * noiseAmp * 2;
        const y = centerY - signal + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Calcular SNR
    const snr = 10 * Math.log10(state.signalPower / state.noisePower);
    const snrText = snr.toFixed(1);
    let quality = '';
    if (snr > 20) quality = 'Excelente';
    else if (snr > 10) quality = 'Buena';
    else if (snr > 5) quality = 'Regular';
    else quality = 'Mala';
    
    if ($('snrResult')) {
        $('snrResult').innerHTML = `<strong>SNR = ${snrText} dB</strong> (${quality} calidad)`;
    }
}

function updateSNRControls() {
    const sigPower = $('signalPower');
    const noisePower = $('noisePower');
    
    if (sigPower) {
        sigPower.addEventListener('input', (e) => {
            state.signalPower = parseFloat(e.target.value);
            $('signalPowerVal').textContent = state.signalPower;
            drawSNR();
        });
    }
    
    if (noisePower) {
        noisePower.addEventListener('input', (e) => {
            state.noisePower = parseFloat(e.target.value);
            $('noisePowerVal').textContent = state.noisePower;
            drawSNR();
        });
    }
}

// ============================================
// SECCIÓN: MODULACIÓN ANALÓGICA
// ============================================
function setAnalogMod(type) {
    state.analogMod = type;
    document.querySelectorAll('#analogica .toggle-group:first-child .toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const info = {
        am: '<strong>AM (Amplitud Modulada):</strong> La amplitud de la portadora varía según la modulante. m = Eₘ/Ec. Ideal: m ≈ 1 (100%). Sobremodulación (m>1) causa distorsión.',
        fm: '<strong>FM (Frecuencia Modulada):</strong> La frecuencia instantánea varía proporcional a la amplitud de la modulante. Índice m = Δf/fm. Más robusta al ruido.',
        pm: '<strong>PM (Fase Modulada):</strong> La fase de la portadora varía proporcional a la amplitud de la modulante. Δf = K·Vm. Si cambia el tono, el índice no cambia.'
    };
    
    if ($('modInfo')) $('modInfo').innerHTML = info[type];
    drawAnalogMod();
}

function drawAnalogMod() {
    const canvas = $('analogModCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    const centerY = height / 2;
    const fm = state.fm * 0.05;
    const modIndex = state.modIndex;
    
    // Dibujar portadora (azul claro, tenue)
    ctx.strokeStyle = 'rgba(0, 188, 212, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        const y = centerY - 40 * Math.sin(x * 0.2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Dibujar modulante (amarillo)
    ctx.strokeStyle = 'rgba(255, 235, 59, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        const y = centerY - 50 * Math.sin(x * fm);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Dibujar señal modulada (naranja)
    ctx.strokeStyle = '#ff5722';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
        const modulating = Math.sin(x * fm);
        let y;
        
        switch(state.analogMod) {
            case 'am':
                // AM: amplitud varía
                const amAmp = 40 * (1 + modIndex * modulating);
                y = centerY - amAmp * Math.sin(x * 0.2);
                break;
                
            case 'fm':
                // FM: frecuencia varía
                const fmFreq = 0.2 + modIndex * 0.1 * modulating;
                y = centerY - 40 * Math.sin(x * fmFreq);
                break;
                
            case 'pm':
                // PM: fase varía
                const pmPhase = modIndex * modulating;
                y = centerY - 40 * Math.sin(x * 0.2 + pmPhase);
                break;
        }
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function updateAnalogModControls() {
    const modIndex = $('modIndex');
    const fm = $('fm');
    
    if (modIndex) {
        modIndex.addEventListener('input', (e) => {
            state.modIndex = parseFloat(e.target.value);
            $('modIndexVal').textContent = state.modIndex.toFixed(1);
            drawAnalogMod();
        });
    }
    
    if (fm) {
        fm.addEventListener('input', (e) => {
            state.fm = parseFloat(e.target.value);
            $('fmVal').textContent = state.fm;
            drawAnalogMod();
        });
    }
}

// ============================================
// SECCIÓN: DEMODULACIÓN
// ============================================
function setDemodStage(stage) {
    state.demodStage = stage;
    document.querySelectorAll('#modulacion .controls .toggle-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === stage);
    });
    drawDemod();
}

function drawDemod() {
    const canvas = $('demodCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    const centerY = height / 2;
    
    // Señal AM
    ctx.strokeStyle = '#ff5722';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
        const envelope = 50 * (1 + 0.5 * Math.sin(x * 0.02));
        const carrier = Math.sin(x * 0.3);
        let y = centerY - envelope * carrier;
        
        switch(state.demodStage) {
            case 1: // Selección (filtrado)
                // Aplicar filtro pasabanda simple
                break;
            case 2: // Detección (rectificación)
                if (y > centerY) y = centerY + (centerY - y);
                break;
            case 3: // Recuperación (suavizado)
                y = centerY - envelope;
                break;
        }
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Dibujar envolvente en etapa de recuperación
    if (state.demodStage === 3) {
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
            const envelope = 50 * (1 + 0.5 * Math.sin(x * 0.02));
            const y = centerY - envelope;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// ============================================
// SECCIÓN: MODULACIÓN DIGITAL
// ============================================
function setDigitalMod(type) {
    state.digitalMod = type;
    document.querySelectorAll('#digital .toggle-group:first-child .toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const info = {
        ask: '<strong>ASK:</strong> Amplitude Shift Keying. "1" = presencia de portadora, "0" = ausencia. Simple pero susceptible al ruido.',
        fsk: '<strong>FSK:</strong> Frequency Shift Keying. "0" = f₁, "1" = f₂. Resistente al ruido pero requiere más ancho de banda.',
        psk: '<strong>PSK:</strong> Phase Shift Keying. 0° = "1", 180° = "0". Más robusta y eficiente. Usada en WiFi y 4G/LTE.',
        qpsk: '<strong>QPSK:</strong> Quadrature PSK. 4 fases (45°, 135°, 225°, 315°). 2 bits por símbolo. Doble velocidad sin más BW.'
    };
    
    if ($('digitalModInfo')) $('digitalModInfo').innerHTML = info[type];
    drawDigitalMod();
}

function drawDigitalMod() {
    const canvas = $('digitalModCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    const centerY = height / 2;
    const bitWidth = width / 8;
    const bits = state.bits.split('').map(b => parseInt(b));
    
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let currentY = centerY;
    
    for (let i = 0; i < bits.length; i++) {
        const bit = bits[i];
        const x = i * bitWidth;
        
        switch(state.digitalMod) {
            case 'ask':
                // ASK: amplitud varía
                const askAmp = bit ? 50 : 10;
                for (let px = 0; px < bitWidth; px++) {
                    const waveY = centerY - askAmp * Math.sin((x + px) * 0.3);
                    if (px === 0 && i === 0) ctx.moveTo(x + px, waveY);
                    else ctx.lineTo(x + px, waveY);
                }
                break;
                
            case 'fsk':
                // FSK: frecuencia varía
                const fskFreq = bit ? 0.4 : 0.2;
                for (let px = 0; px < bitWidth; px++) {
                    const waveY = centerY - 50 * Math.sin((x + px) * fskFreq);
                    if (px === 0 && i === 0) ctx.moveTo(x + px, waveY);
                    else ctx.lineTo(x + px, waveY);
                }
                break;
                
            case 'psk':
            case 'qpsk':
                // PSK: fase varía
                let phase = 0;
                if (state.digitalMod === 'psk') {
                    phase = bit ? 0 : Math.PI;
                } else {
                    // QPSK: 2 bits por símbolo
                    const symbol = (bits[i] << 1) | (bits[(i + 1) % bits.length]);
                    phase = (symbol * Math.PI / 2) + Math.PI / 4;
                }
                for (let px = 0; px < bitWidth; px++) {
                    const waveY = centerY - 50 * Math.sin((x + px) * 0.3 + phase);
                    if (px === 0 && i === 0) ctx.moveTo(x + px, waveY);
                    else ctx.lineTo(x + px, waveY);
                }
                break;
        }
    }
    ctx.stroke();
    
    // Dibujar bits
    ctx.fillStyle = '#e6edf3';
    ctx.font = '14px monospace';
    for (let i = 0; i < bits.length; i++) {
        ctx.fillText(bits[i].toString(), i * bitWidth + bitWidth / 2 - 5, height - 10);
    }
}

function randomBits() {
    state.bits = '';
    for (let i = 0; i < 8; i++) {
        state.bits += Math.random() > 0.5 ? '1' : '0';
    }
    if ($('bitSequence')) $('bitSequence').value = state.bits;
    drawDigitalMod();
}

function setBits(bits) {
    state.bits = bits;
    if ($('bitSequence')) $('bitSequence').value = state.bits;
    drawDigitalMod();
}

function updateDigitalModControls() {
    const bitSeq = $('bitSequence');
    if (bitSeq) {
        bitSeq.addEventListener('input', (e) => {
            const val = e.target.value.replace(/[^01]/g, '').substring(0, 8);
            state.bits = val;
            drawDigitalMod();
        });
    }
}

// ============================================
// SECCIÓN: CONSTELACIONES
// ============================================
function setConstellation(type) {
    state.constellation = type;
    document.querySelectorAll('#digital .toggle-group:nth-child(2) .toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const info = {
        bpsk: '<strong>BPSK:</strong> 2 puntos, 1 bit/símbolo. Fases 0° y 180°.',
        qpsk: '<strong>QPSK:</strong> 4 puntos, 2 bits/símbolo. Fases 45°, 135°, 225°, 315°.',
        '8psk': '<strong>8-PSK:</strong> 8 puntos, 3 bits/símbolo.',
        '16qam': '<strong>16-QAM:</strong> 16 puntos en rejilla, 4 bits/símbolo. Combina amplitud y fase.'
    };
    
    if ($('constellationInfo')) $('constellationInfo').innerHTML = info[type];
    drawConstellation();
}

function drawConstellation() {
    const container = $('constellationContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const points = {
        bpsk: [
            {x: 0.7, y: 0.5, label: '0° (1)'},
            {x: 0.3, y: 0.5, label: '180° (0)'}
        ],
        qpsk: [
            {x: 0.65, y: 0.35, label: '45° (00)'},
            {x: 0.35, y: 0.35, label: '135° (01)'},
            {x: 0.35, y: 0.65, label: '225° (11)'},
            {x: 0.65, y: 0.65, label: '315° (10)'}
        ],
        '8psk': [
            {x: 0.7, y: 0.5, label: '0°'}, {x: 0.64, y: 0.36, label: '45°'},
            {x: 0.5, y: 0.3, label: '90°'}, {x: 0.36, y: 0.36, label: '135°'},
            {x: 0.3, y: 0.5, label: '180°'}, {x: 0.36, y: 0.64, label: '225°'},
            {x: 0.5, y: 0.7, label: '270°'}, {x: 0.64, y: 0.64, label: '315°'}
        ],
        '16qam': []
    };
    
    // Generar puntos 16-QAM
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            points['16qam'].push({
                x: 0.25 + j * 0.17,
                y: 0.25 + i * 0.17,
                label: `${i*4+j}`
            });
        }
    }
    
    // Dibujar ejes
    const axisX = document.createElement('div');
    axisX.style.cssText = 'position:absolute;left:10%;right:10%;top:50%;height:1px;background:#8b949e;';
    container.appendChild(axisX);
    
    const axisY = document.createElement('div');
    axisY.style.cssText = 'position:absolute;top:10%;bottom:10%;left:50%;width:1px;background:#8b949e;';
    container.appendChild(axisY);
    
    // Dibujar puntos
    points[state.constellation].forEach(p => {
        const point = document.createElement('div');
        point.className = 'constellation-point';
        point.style.left = `${p.x * 100}%`;
        point.style.top = `${p.y * 100}%`;
        point.setAttribute('data-label', p.label);
        container.appendChild(point);
    });
}

// ============================================
// SECCIÓN: ESPECTRO
// ============================================
function updateSpectral() {
    const select = $('spectralMod');
    if (select) drawSpectral(select.value);
}

function drawSpectral(type) {
    const canvas = $('spectralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    const centerX = width / 2;
    
    // Dibujar espectro según modulación
    ctx.fillStyle = '#00bcd4';
    
    const bandwidths = {
        bpsk: 0.3,
        qpsk: 0.3,
        '8psk': 0.3,
        '16qam': 0.3
    };
    
    const bw = bandwidths[type] || 0.3;
    
    // Lóbulo principal
    ctx.beginPath();
    ctx.moveTo(centerX - width * bw, height);
    ctx.lineTo(centerX - width * bw * 0.5, height * 0.2);
    ctx.lineTo(centerX, height * 0.15);
    ctx.lineTo(centerX + width * bw * 0.5, height * 0.2);
    ctx.lineTo(centerX + width * bw, height);
    ctx.closePath();
    ctx.fill();
    
    // Lóbulos secundarios
    ctx.globalAlpha = 0.3;
    [-1.5, 1.5].forEach(factor => {
        ctx.beginPath();
        ctx.moveTo(centerX + factor * width * bw, height);
        ctx.lineTo(centerX + factor * width * bw - width * bw * 0.25, height * 0.4);
        ctx.lineTo(centerX + factor * width * bw, height * 0.35);
        ctx.lineTo(centerX + factor * width * bw + width * bw * 0.25, height * 0.4);
        ctx.closePath();
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// ============================================
// SECCIÓN: PCM
// ============================================
function setPcmStage(stage) {
    state.pcmStage = stage;
    document.querySelectorAll('#pcm .controls:first-child .toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    drawPCM();
}

function drawPCM() {
    const canvas = $('pcmCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    const centerY = height / 2;
    
    // Señal analógica original
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const samplePoints = [];
    
    for (let x = 0; x < width; x++) {
        const t = x * 0.02;
        const y = centerY - 80 * Math.sin(t) * Math.exp(-t * 0.01);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        // Guardar puntos de muestreo
        if (x % 40 === 0) {
            samplePoints.push({x, y});
        }
    }
    ctx.stroke();
    
    if (state.pcmStage === 'muestreo' || state.pcmStage === 'completo') {
        // Dibujar muestras
        ctx.fillStyle = '#ff5722';
        samplePoints.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    if (state.pcmStage === 'cuantificacion' || state.pcmStage === 'completo') {
        // Dibujar niveles de cuantificación
        const levels = state.quantLevels;
        const stepY = 160 / levels;
        
        ctx.strokeStyle = 'rgba(255, 235, 59, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= levels; i++) {
            const y = centerY - 80 + i * stepY;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Dibujar valores cuantificados
        ctx.fillStyle = '#ffeb3b';
        samplePoints.forEach(p => {
            const quantY = Math.round((p.y - centerY + 80) / stepY) * stepY + centerY - 80;
            ctx.beginPath();
            ctx.arc(p.x, quantY, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Línea de cuantificación
            ctx.strokeStyle = '#ffeb3b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, quantY);
            ctx.stroke();
        });
    }
}

function updatePCMControls() {
    const quantLevels = $('quantLevels');
    if (quantLevels) {
        quantLevels.addEventListener('input', (e) => {
            state.quantLevels = parseInt(e.target.value);
            $('quantLevelsVal').textContent = state.quantLevels;
            drawPCM();
        });
    }
}

// ============================================
// SECCIÓN: MODULACIÓN DE PULSOS
// ============================================
function setPulseMod(type) {
    state.pulseMod = type;
    document.querySelectorAll('#pcm .toggle-group .toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const info = {
        pam: '<strong>PAM:</strong> Modula la amplitud de cada pulso según la señal modulante. Paso previo al PCM.',
        pwm: '<strong>PWM:</strong> Modula el ancho (duración) del pulso. Amplitud constante, posición inicial fija.',
        ppm: '<strong>PPM:</strong> Modula la posición temporal del pulso. Amplitud y ancho constantes.'
    };
    
    if ($('pulseModInfo')) $('pulseModInfo').innerHTML = info[type];
    drawPulseMod();
}

function drawPulseMod() {
    const canvas = $('pulseModCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    const centerY = height / 2;
    const pulseWidth = width / 10;
    
    // Dibujar señal modulante (tenue)
    ctx.strokeStyle = 'rgba(255, 235, 59, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        const y = centerY - 60 * Math.sin(x * 0.05);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Dibujar pulsos
    ctx.fillStyle = '#00bcd4';
    
    for (let i = 0; i < 8; i++) {
        const x = i * pulseWidth + pulseWidth * 0.5;
        const modValue = Math.sin(i * 0.5);
        
        let pulseX, pulseW, pulseH;
        
        switch(state.pulseMod) {
            case 'pam':
                // Amplitud varía
                pulseX = x + 10;
                pulseW = pulseWidth * 0.5;
                pulseH = 20 + 40 * Math.abs(modValue);
                break;
                
            case 'pwm':
                // Ancho varía
                pulseX = x + 10;
                pulseW = pulseWidth * 0.3 + pulseWidth * 0.4 * Math.abs(modValue);
                pulseH = 40;
                break;
                
            case 'ppm':
                // Posición varía
                pulseX = x + 10 + 20 * modValue;
                pulseW = pulseWidth * 0.3;
                pulseH = 40;
                break;
        }
        
        ctx.fillRect(pulseX, centerY - pulseH, pulseW, pulseH);
    }
}

// ============================================
// SECCIÓN: ERRORES
// ============================================
function setErrorMethod(method) {
    state.errorMethod = method;
    document.querySelectorAll('#errores .toggle-group:first-child .toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    updateErrorDisplay();
}

function updateErrorDisplay() {
    const dataBits = state.dataBits;
    let result = '';
    let info = '';
    
    switch(state.errorMethod) {
        case 'paridad':
            const ones = dataBits.filter(b => b === 1).length;
            const parityBit = ones % 2 === 0 ? 0 : 1;
            result = [...dataBits, parityBit].map((b, i) => 
                `<span class="bit ${i === 8 ? 'parity' : ''}">${b}</span>`
            ).join('');
            info = 'Paridad Par: Agregar bit para que cantidad de 1s sea par';
            break;
            
        case 'bloque':
            result = dataBits.map(b => `<span class="bit">${b}</span>`).join('') + 
                    '<br><span style="color:#8b949e">+ Paridad horizontal y vertical</span>';
            info = 'Paridad de Bloque: Paridad en dos dimensiones (vertical y horizontal)';
            break;
            
        case 'checksum':
            const sum = dataBits.reduce((a, b) => a + b, 0);
            const checksum = (~sum & 0xFF);
            result = dataBits.map(b => `<span class="bit">${b}</span>`).join('') + 
                    ` <span class="bit parity">CS:${checksum}</span>`;
            info = 'Checksum: Suma aritmética + complemento a 1';
            break;
            
        case 'crc':
            result = dataBits.map(b => `<span class="bit">${b}</span>`).join('') + 
                    ' <span class="bit parity">CRC</span>';
            info = 'CRC: División polinómica, el resto se envía con el mensaje';
            break;
    }
    
    if ($('resultBits')) $('resultBits').innerHTML = result;
    if ($('errorDetectionResult')) $('errorDetectionResult').innerHTML = `<strong>${state.errorMethod.toUpperCase()}:</strong> ${info}`;
}

function introduceError() {
    const pos = Math.floor(Math.random() * state.dataBits.length);
    state.dataBits[pos] = state.dataBits[pos] === 1 ? 0 : 1;
    updateDataBitsDisplay();
    updateErrorDisplay();
}

function updateDataBitsDisplay() {
    const container = $('dataBits');
    if (!container) return;
    
    container.innerHTML = state.dataBits.map((b, i) => 
        `<span class="bit ${b === 1 ? 'error' : ''}" data-pos="${i}" onclick="toggleDataBit(${i})">${b}</span>`
    ).join('');
}

function toggleDataBit(pos) {
    state.dataBits[pos] = state.dataBits[pos] === 1 ? 0 : 1;
    updateDataBitsDisplay();
    updateErrorDisplay();
}

// ============================================
// SECCIÓN: HAMMING
// ============================================
function calculateHamming(data) {
    // Código Hamming (7,4)
    const d = [...data];
    const p1 = d[0] ^ d[1] ^ d[3];
    const p2 = d[0] ^ d[2] ^ d[3];
    const p3 = d[1] ^ d[2] ^ d[3];
    return [p1, p2, d[0], p3, d[1], d[2], d[3]];
}

function updateHammingDisplay() {
    const code = calculateHamming(state.hammingData);
    state.hammingCode = code;
    
    if ($('hammingData')) {
        $('hammingData').innerHTML = state.hammingData.map((b, i) => 
            `<span class="bit" onclick="toggleHammingBit(${i})">${b}</span>`
        ).join('');
    }
    
    if ($('hammingCode')) {
        $('hammingCode').innerHTML = code.map((b, i) => {
            const isParity = [0, 1, 3].includes(i);
            const hasError = state.hammingError === i ? 'error' : '';
            return `<span class="bit ${isParity ? 'parity' : ''} ${hasError}">${b}</span>`;
        }).join('');
    }
}

function toggleHammingBit(pos) {
    state.hammingData[pos] = state.hammingData[pos] === 1 ? 0 : 1;
    state.hammingError = -1;
    updateHammingDisplay();
}

function introduceHammingError() {
    state.hammingError = Math.floor(Math.random() * 7);
    state.hammingCode[state.hammingError] = state.hammingCode[state.hammingError] === 1 ? 0 : 1;
    updateHammingDisplay();
    
    if ($('hammingResult')) {
        $('hammingResult').innerHTML = `<strong>Error introducido</strong> en posición ${state.hammingError + 1}. Usa "Detectar y Corregir".`;
    }
}

function detectHammingError() {
    if (state.hammingError === -1) {
        if ($('hammingResult')) {
            $('hammingResult').innerHTML = 'No hay error detectado. El código está correcto.';
        }
        return;
    }
    
    // Calcular síndrome
    const c = state.hammingCode;
    const s1 = c[0] ^ c[2] ^ c[4] ^ c[6];
    const s2 = c[1] ^ c[2] ^ c[5] ^ c[6];
    const s3 = c[3] ^ c[4] ^ c[5] ^ c[6];
    const syndrome = s1 + s2 * 2 + s3 * 4;
    
    if (syndrome === 0) {
        if ($('hammingResult')) {
            $('hammingResult').innerHTML = 'No hay error detectado.';
        }
    } else {
        // Corregir
        state.hammingCode[syndrome - 1] = state.hammingCode[syndrome - 1] === 1 ? 0 : 1;
        state.hammingError = -1;
        updateHammingDisplay();
        
        if ($('hammingResult')) {
            $('hammingResult').innerHTML = `<strong>Error detectado y corregido</strong> en posición ${syndrome}. El síndrome ${s3}${s2}${s1} (binario) = ${syndrome} (decimal) indica la posición del error.`;
        }
    }
}

// ============================================
// NAVEGACIÓN
// ============================================
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const section = $(sectionId);
    if (section) section.classList.add('active');
    
    // Actualizar tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Redibujar canvas
    setTimeout(() => {
        drawSinusoid();
        drawSignalType();
        drawPerturbations();
        drawSNR();
        drawAnalogMod();
        drawDemod();
        drawDigitalMod();
        drawConstellation();
        updateSpectral();
        drawPCM();
        drawPulseMod();
    }, 100);
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Configurar controles
    updateSinusoidControls();
    updatePerturbationControls();
    updateSNRControls();
    updateAnalogModControls();
    updateDigitalModControls();
    updatePCMControls();
    
    // Configurar bits
    updateDataBitsDisplay();
    updateHammingDisplay();
    updateErrorDisplay();
    
    // Dibujar todo
    drawSinusoid();
    drawSignalType();
    drawPerturbations();
    drawSNR();
    drawAnalogMod();
    drawDemod();
    drawDigitalMod();
    drawConstellation();
    updateSpectral();
    drawPCM();
    drawPulseMod();
    
    // Redibujar en resize
    window.addEventListener('resize', () => {
        drawSinusoid();
        drawSignalType();
        drawPerturbations();
        drawSNR();
        drawAnalogMod();
        drawDemod();
        drawDigitalMod();
        drawConstellation();
        updateSpectral();
        drawPCM();
        drawPulseMod();
    });
    
    console.log('Sistemas de Comunicación - App inicializada');
});
