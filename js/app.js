const map = L.map('map').setView([-25.45,-49.27],19);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const grafo = {
  entrada: [-25.4500,-49.2700],
  corredor1: [-25.4502,-49.2702],
  corredor2: [-25.4504,-49.2704],
  biblioteca: [-25.4506,-49.2706],
  secretaria: [-25.4498,-49.2698],
  banheiro: [-25.4503,-49.2701]
};

const conexoes = {
  entrada: ['corredor1'],
  corredor1: ['entrada','corredor2','banheiro'],
  corredor2: ['corredor1','biblioteca'],
  biblioteca: ['corredor2'],
  secretaria: ['entrada'],
  banheiro: ['corredor1']
};

let userMarker, rota;

navigator.geolocation.watchPosition(pos=>{
  const p=[pos.coords.latitude,pos.coords.longitude];
  if(userMarker) map.removeLayer(userMarker);
  userMarker=L.marker(p).addTo(map).bindPopup("Você está aqui");
});

function entender(frase){
  frase=frase.toLowerCase();
  if(frase.includes('biblioteca')) return 'biblioteca';
  if(frase.includes('secretaria')) return 'secretaria';
  if(frase.includes('banheiro')) return 'banheiro';
  return null;
}

function rotaInteligente(destino){
  let fila=['entrada'];
  let visitado={entrada:null};

  while(fila.length){
    let atual=fila.shift();
    if(atual===destino) break;
    conexoes[atual].forEach(v=>{
      if(!visitado[v]){
        visitado[v]=atual;
        fila.push(v);
      }
    });
  }

  let caminho=[];
  let passo=destino;
  while(passo){
    caminho.unshift(grafo[passo]);
    passo=visitado[passo];
  }

  return caminho;
}

function desenhar(caminho){
  if(rota) map.removeLayer(rota);
  rota=L.polyline(caminho).addTo(map);
  map.fitBounds(rota.getBounds());
  falarPassoAPasso(caminho);
}

function falar(texto){
  const u=new SpeechSynthesisUtterance(texto);
  u.lang='pt-BR';
  speechSynthesis.speak(u);
}

function vibrar(){
  if(navigator.vibrate) navigator.vibrate([200,100,200]);
}

function falarPassoAPasso(caminho){
  for(let i=0;i<caminho.length;i++){
    setTimeout(()=>{
      falar('Siga para o próximo ponto');
      vibrar();
    }, i*3000);
  }
}

function ouvir(){
  const rec=new (window.SpeechRecognition||window.webkitSpeechRecognition)();
  rec.lang='pt-BR';
  rec.start();

  rec.onresult=e=>{
    const frase=e.results[0][0].transcript;
    document.getElementById('saida').innerText=frase;

    const destino=entender(frase);

    if(destino){
      falar('Claro, vou te levar até ' + destino);
      const caminho=rotaInteligente(destino);
      desenhar(caminho);
    }else{
      falar('Desculpe, não entendi. Pode repetir?');
    }
  }
}
