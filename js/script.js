function falar(texto) {
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  speechSynthesis.speak(fala);
}

function iniciarReconhecimento() {
  const reconhecimento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  reconhecimento.lang = 'pt-BR';

  reconhecimento.start();

  reconhecimento.onresult = function(event) {
    const comando = event.results[0][0].transcript.toLowerCase();
    document.getElementById('saida').innerText = "Você disse: " + comando;

    processarComando(comando);
  };

  reconhecimento.onerror = function() {
    falar("Erro ao reconhecer voz");
  };
}

function processarComando(comando) {
  let resposta = "Não entendi o destino.";

  if (comando.includes("biblioteca")) {
    resposta = "Siga em frente e vire à direita. A biblioteca está no final do corredor.";
  } else if (comando.includes("secretaria")) {
    resposta = "Siga em frente e vire à esquerda. A secretaria fica ao lado da entrada.";
  } else if (comando.includes("banheiro")) {
    resposta = "O banheiro acessível está próximo à cantina.";
  }

  document.getElementById('saida').innerText += "\n" + resposta;
  falar(resposta);
}
