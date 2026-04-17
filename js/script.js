const map = L.map('map').setView([-25.45,-49.27],19);

// mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 🗺️ planta simulada (imagem exemplo)
const bounds = [[-25.451,-49.271],[-25.449,-49.269]];
L.imageOverlay('https://i.imgur.com/6Iej2c3.png', bounds).addTo(map);

// 📍 pontos da escola
const pontos = {
  entrada:[-25.4509,-49.2709],
  secretaria:[-25.4507,-49.2707],
  corredor1:[-25.4506,-49.2705],
  corredor2:[-25.4504,-49.2703],
  sala1:[-25.4503,-49.2702],
  sala2:[-25.4502,-49.2701],
  biblioteca:[-25.4501,-49.2700],
  laboratorio:[-25.4505,-49.2702],
  banheiro:[-25.4506,-49.2703],
  patio:[-25.4508,-49.2704]
};

// 🔗 conexões (mapa interno realista)
const conexoes = {
  entrada:['secretaria','corredor1'],
  secretaria:['entrada'],
  corredor1:['entrada','corredor2','banheiro','laboratorio'],
  corredor2:['corredor1','sala1','sala2','biblioteca'],
  sala1:['corredor2'],
  sala2:['corredor2'],
  biblioteca:['corredor2'],
  laboratorio:['corredor1'],
  banheiro:['corredor1'],
  patio:['entrada']
};

let rota;

// 🧠 IA melhorada
function entender(frase){
  frase = frase.toLowerCase();

  if(frase.includes('biblioteca')) return 'biblioteca';
  if(frase.includes('laboratorio')) return 'laboratorio';
  if(frase.includes('secretaria')) return 'secretaria';
  if(frase.includes('banheiro')) return 'banheiro';
  if(frase.includes('pátio') || frase.includes('patio')) return 'patio';
  if(frase.includes('sala 1')) return 'sala1';
  if(frase.includes('sala 2')) return 'sala2';

  return null;
}

// 🧭 algoritmo de rota (BFS)
function calcularRota(destino){
  let fila = ['entrada'];
  let visitado = {entrada:null};

  while(fila.length){
    let atual = fila.shift();
    if(atual === destino) break;

    conexoes[atual].forEach(v=>{
      if(!visitado[v]){
        visitado[v] = atual;
        fila.push(v);
      }
    });
  }

  let caminho = [];
  let passo = destino;

  while(passo){
    caminho.unshift(pontos[passo]);
    passo = visitado[passo];
  }

  return caminho;
}

// 🗺️ desenhar rota
function desenharRota(caminho){
  if(rota) map.removeLayer(rota);

  rota = L.polyline(caminho).addTo(map);
  map.fitBounds(rota.getBounds());

  instrucoes(caminho);
}

// 🔊 voz + vibração
function falar(texto){
  let u = new SpeechSynthesisUtterance(texto);
  u.lang = 'pt-BR';
  speechSynthesis.speak(u);
}

function vibrar(){
  if(navigator.vibrate){
    navigator.vibrate([200,100,200]);
  }
}

// 📳 instruções passo a passo
function instrucoes(caminho){
  caminho.forEach((_,i)=>{
    setTimeout(()=>{
      falar("Siga para o próximo ponto");
      vibrar();
    }, i*2500);
  });
}

// 🎤 reconhecimento de voz
function ouvir(){
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = 'pt-BR';
  rec.start();

  rec.onresult = e=>{
    let frase = e.results[0][0].transcript;
    document.getElementById('saida').innerText = frase;

    let destino = entender(frase);

    if(destino){
      falar("Ok, te levando até " + destino);
      let caminho = calcularRota(destino);
      desenharRota(caminho);
    }else{
      falar("Não entendi, tente novamente");
    }
  }
}
