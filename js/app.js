// ====================== js/app.js ======================
// Guia Escolar Inteligente - Colégio Estadual Benedito João Cordeiro

const map = L.map('map', { 
    zoomControl: true,
    attributionControl: false 
}).setView([-25.4505, -49.2702], 19);

// Mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 22,
    minZoom: 17
}).addTo(map);

// 🗺️ MELHOR PLANTA BAIXA - Recomendada
const bounds = [[-25.4528, -49.2728], [-25.4482, -49.2682]];

L.imageOverlay(
    'https://i.imgur.com/8vKzL9p.png',   // ← Melhor imagem recomendada
    bounds, 
    { 
        opacity: 0.92,     // Ajuste entre 0.7 e 1.0
        interactive: true 
    }
).addTo(map);

// Título da escola flutuante
L.marker([-25.4524, -49.2715], {
    icon: L.divIcon({
        className: 'map-title',
        html: `<div style="background:rgba(30,64,175,0.9); color:white; padding:8px 16px; border-radius:8px; font-size:15px; font-weight:bold; box-shadow:0 4px 12px rgba(0,0,0,0.6);">🏫 Colégio Estadual Benedito João Cordeiro</div>`,
        iconSize: [340, 45]
    })
}).addTo(map);

// ==================== Pontos da Escola ====================
const pontos = {
    entrada:    [-25.4509, -49.2709],
    secretaria: [-25.4507, -49.2707],
    corredor1:  [-25.4506, -49.2705],
    corredor2:  [-25.4504, -49.2703],
    sala1:      [-25.4503, -49.2702],
    sala2:      [-25.4502, -49.2701],
    biblioteca: [-25.4501, -49.2700],
    laboratorio:[-25.4505, -49.2702],
    banheiro:   [-25.4506, -49.2703],
    patio:      [-25.4508, -49.2704]
};

// ==================== Conexões ====================
const conexoes = {
    entrada:    ['secretaria', 'corredor1', 'patio'],
    secretaria: ['entrada'],
    corredor1:  ['entrada', 'corredor2', 'banheiro', 'laboratorio'],
    corredor2:  ['corredor1', 'sala1', 'sala2', 'biblioteca'],
    sala1:      ['corredor2'],
    sala2:      ['corredor2'],
    biblioteca: ['corredor2'],
    laboratorio:['corredor1'],
    banheiro:   ['corredor1'],
    patio:      ['entrada']
};

let rotaAtual = null;

// ==================== Entender comando de voz ====================
function entender(frase) {
    frase = frase.toLowerCase().trim();
    if (frase.includes('biblioteca')) return 'biblioteca';
    if (frase.includes('laboratório') || frase.includes('laboratorio')) return 'laboratorio';
    if (frase.includes('secretaria')) return 'secretaria';
    if (frase.includes('banheiro')) return 'banheiro';
    if (frase.includes('pátio') || frase.includes('patio')) return 'patio';
    if (frase.includes('sala 1') || frase.includes('sala1')) return 'sala1';
    if (frase.includes('sala 2') || frase.includes('sala2')) return 'sala2';
    if (frase.includes('entrada')) return 'entrada';
    return null;
}

// ==================== Calcular Rota ====================
function calcularRota(destino) {
    let fila = ['entrada'];
    let visitado = { entrada: null };

    while (fila.length > 0) {
        let atual = fila.shift();
        if (atual === destino) break;
        if (conexoes[atual]) {
            conexoes[atual].forEach(vizinho => {
                if (!visitado[vizinho]) {
                    visitado[vizinho] = atual;
                    fila.push(vizinho);
                }
            });
        }
    }

    let caminho = [];
    let passo = destino;
    while (passo) {
        caminho.unshift(pontos[passo]);
        passo = visitado[passo];
    }
    return caminho;
}

// ==================== Desenhar Rota ====================
function desenharRota(caminho) {
    if (rotaAtual) map.removeLayer(rotaAtual);
    rotaAtual = L.polyline(caminho, { 
        color: '#22c55e', 
        weight: 8, 
        opacity: 0.95 
    }).addTo(map);
    map.fitBounds(rotaAtual.getBounds(), { padding: [70, 70] });
}

// ==================== Voz ====================
function falar(texto) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.08;
    speechSynthesis.speak(utterance);
}

function vibrar() {
    if (navigator.vibrate) navigator.vibrate([180, 100, 180]);
}

// ==================== Reconhecimento de Voz ====================
function ouvir() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Use o Google Chrome para o reconhecimento de voz funcionar.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    document.getElementById('saida').innerHTML = `<span style="color:#22c55e">🎤 Ouvindo... fale agora</span>`;

    recognition.start();

    recognition.onresult = function(event) {
        const frase = event.results[0][0].transcript.trim();
        document.getElementById('saida').innerHTML = `<strong>Você disse:</strong> ${frase}`;

        const destino = entender(frase);
        if (destino) {
            falar(`Ok, te levando até ${destino.replace('sala', 'sala ')}`);
            const caminho = calcularRota(destino);
            if (caminho.length > 1) desenharRota(caminho);
        } else {
            falar("Não entendi. Tente: biblioteca, laboratório, secretaria, banheiro");
        }
    };

    recognition.onerror = function() {
        document.getElementById('saida').innerHTML = `<span style="color:#ef4444">❌ Erro. Verifique o microfone.</span>`;
    };
}
