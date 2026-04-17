// ====================== js/app.js ======================
// Guia Escolar Inteligente - Colégio Estadual Benedito João Cordeiro

// ==================== Inicialização do Mapa ====================
const map = L.map('map', { 
    zoomControl: true,
    attributionControl: false 
}).setView([-25.4505, -49.2702], 19);

// Mapa base (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 22,
    minZoom: 17
}).addTo(map);

// 🗺️ PLANTA BAIXA DA ESCOLA (Overlay)
const bounds = [[-25.4525, -49.2725], [-25.4485, -49.2685]];

L.imageOverlay(
    'https://i.imgur.com/8vKzL9p.png', 
    bounds, 
    { 
        opacity: 0.90,
        interactive: true 
    }
).addTo(map);

// Título da escola no mapa
L.marker([-25.4522, -49.2718], {
    icon: L.divIcon({
        className: 'map-title',
        html: `<div style="background:rgba(30,64,175,0.85); color:white; padding:6px 14px; border-radius:8px; font-size:15px; font-weight:bold; white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,0.5);">🏫 Colégio Estadual Benedito João Cordeiro</div>`,
        iconSize: [320, 40]
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

// ==================== Conexões (Grafo da Escola) ====================
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

// ==================== Função IA - Entender Comando ====================
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

// ==================== Calcular Rota (BFS) ====================
function calcularRota(destino) {
    let fila = ['entrada'];
    let visitado = { entrada: null };
    let encontrado = false;

    while (fila.length > 0) {
        let atual = fila.shift();
        if (atual === destino) {
            encontrado = true;
            break;
        }
        if (conexoes[atual]) {
            conexoes[atual].forEach(vizinho => {
                if (!visitado.hasOwnProperty(vizinho)) {
                    visitado[vizinho] = atual;
                    fila.push(vizinho);
                }
            });
        }
    }

    if (!encontrado) return [];

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
        weight: 7, 
        opacity: 0.95,
        lineJoin: 'round'
    }).addTo(map);
    
    map.fitBounds(rotaAtual.getBounds(), { padding: [60, 60] });
}

// ==================== Voz e Vibração ====================
function falar(texto) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
    }
}

function vibrar() {
    if (navigator.vibrate) {
        navigator.vibrate([150, 80, 150]);
    }
}

// ==================== Reconhecimento de Voz (Corrigido) ====================
function ouvir() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("❌ Seu navegador não suporta reconhecimento de voz.\n\nUse Google Chrome!");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = false;

    document.getElementById('saida').innerHTML = 
        `<span style="color:#22c55e; font-weight:bold;">🎤 Ouvindo... fale agora</span>`;

    recognition.start();

    recognition.onresult = function(event) {
        const frase = event.results[0][0].transcript.trim();
        document.getElementById('saida').innerHTML = 
            `<strong>Você disse:</strong><br>${frase}`;

        const destino = entender(frase);

        if (destino) {
            falar(`Ok, te levando até ${destino.replace('sala', 'sala ')}`);
            const caminho = calcularRota(destino);
            
            if (caminho.length > 0) {
                desenharRota(caminho);
                
                // Instruções passo a passo com voz
                caminho.forEach((_, i) => {
                    setTimeout(() => {
                        falar("Siga para o próximo ponto");
                        vibrar();
                    }, i * 3000);
                });
            }
        } else {
            falar("Não entendi. Tente: biblioteca, laboratório, secretaria, banheiro ou sala 1");
        }
    };

    recognition.onerror = function(event) {
        console.error(event.error);
        let mensagem = "Erro no reconhecimento";

        if (event.error === "not-allowed") mensagem = "❌ Permissão de microfone negada";
        if (event.error === "no-speech") mensagem = "⚠️ Nenhuma fala detectada. Tente novamente";
        if (event.error === "audio-capture") mensagem = "❌ Microfone não encontrado";

        document.getElementById('saida').innerHTML = 
            `<span style="color:#ef4444;">${mensagem}</span>`;
    };

    recognition.onend = function() {
        console.log("Reconhecimento finalizado");
    };
}
