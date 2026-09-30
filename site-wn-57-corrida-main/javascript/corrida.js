let categoriaSelecionada = "WN";
let valorSelecionado = 15;

document.addEventListener("DOMContentLoaded", function () {
  const origem = localStorage.getItem("origemCorrida");
  const destino = localStorage.getItem("destinoCorrida");

  if (!origem || !destino) {
    alert("Informe sua localização e destino primeiro.");
    window.location.href = "solicitar.html";
    return;
  }

  const mostrarOrigem = document.getElementById("mostrarOrigem");
  const mostrarDestino = document.getElementById("mostrarDestino");

  if (mostrarOrigem) {
    mostrarOrigem.textContent = origem;
  }

  if (mostrarDestino) {
    mostrarDestino.textContent = destino;
  }

  iniciarMapa(origem, destino);
});


// =========================
// MAPA E ROTA
// =========================

function iniciarMapa(origem, destino) {
  const mapa = L.map("map").setView(
    [-25.4428, -49.1925],
    13
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(mapa);


  // Coordenadas em formato LATITUDE, LONGITUDE
  // Origem: Pinhais
  const origemCoords = [-25.4428, -49.1925];

  // Destino: Curitiba
  const destinoCoords = [-25.4284, -49.2733];


  // Marcador da origem
  L.marker(origemCoords)
    .addTo(mapa)
    .bindPopup("📍 " + origem);


  // Marcador do destino
  L.marker(destinoCoords)
    .addTo(mapa)
    .bindPopup("🏁 " + destino);


  /*
    O OSRM recebe LONGITUDE, LATITUDE.
    Por isso usamos:
    origemCoords[1], origemCoords[0]
  */

  const url =
    "https://router.project-osrm.org/route/v1/driving/" +
    origemCoords[1] + "," + origemCoords[0] + ";" +
    destinoCoords[1] + "," + destinoCoords[0] +
    "?overview=full&geometries=geojson";


  fetch(url)
    .then(function (resposta) {
      if (!resposta.ok) {
        throw new Error("Não foi possível buscar a rota.");
      }

      return resposta.json();
    })
    .then(function (dados) {
      if (
        dados.code !== "Ok" ||
        !dados.routes ||
        dados.routes.length === 0
      ) {
        throw new Error("Nenhuma rota encontrada.");
      }

      const rota = dados.routes[0];


      // Distância em quilômetros
      const distanciaKm = rota.distance / 1000;

      // Tempo em minutos
      const tempoMinutos = Math.ceil(rota.duration / 60);


      // Mostrar distância
      const distanciaElemento =
        document.getElementById("distanciaRota");

      if (distanciaElemento) {
        distanciaElemento.textContent =
          distanciaKm.toFixed(1).replace(".", ",") + " km";
      }


      // Mostrar tempo
      const tempoElemento =
        document.getElementById("tempoRota");

      if (tempoElemento) {
        tempoElemento.textContent =
          "Aproximadamente " + tempoMinutos + " min";
      }


      // Desenhar a rota seguindo as ruas
      const linhaRota = L.geoJSON(rota.geometry, {
        style: {
          color: "#ff2d78",
          weight: 6,
          opacity: 0.95
        }
      }).addTo(mapa);


      // Mostrar a rota inteira na tela
      mapa.fitBounds(linhaRota.getBounds(), {
        padding: [50, 50]
      });
    })
    .catch(function (erro) {
      console.error("Erro da rota:", erro);

      const distanciaElemento =
        document.getElementById("distanciaRota");

      const tempoElemento =
        document.getElementById("tempoRota");

      if (distanciaElemento) {
        distanciaElemento.textContent = "Rota indisponível";
      }

      if (tempoElemento) {
        tempoElemento.textContent = "Tente novamente";
      }
    });
}


// =========================
// SELECIONAR CARRO
// =========================

function selecionarCarro(elemento, categoria, valor) {
  document.querySelectorAll(".categoria").forEach(function (card) {
    card.classList.remove("ativa");
  });

  elemento.classList.add("ativa");

  categoriaSelecionada = categoria;
  valorSelecionado = valor;

  const categoriaElemento =
    document.getElementById("categoriaEscolhida");

  const valorElemento =
    document.getElementById("valorCorrida");

  if (categoriaElemento) {
    categoriaElemento.textContent = categoria;
  }

  if (valorElemento) {
    valorElemento.textContent =
      "R$ " + valor.toFixed(2).replace(".", ",");
  }
}


// =========================
// EDITAR ROTA
// =========================

function voltarEditar() {
  window.location.href = "solicitar.html";
}


// =========================
// CONFIRMAR CORRIDA
// =========================

function confirmarCorrida() {
  const origem = localStorage.getItem("origemCorrida");
  const destino = localStorage.getItem("destinoCorrida");

  if (!origem || !destino) {
    alert("Dados da corrida não encontrados.");
    return;
  }

  localStorage.setItem(
    "categoriaCorrida",
    categoriaSelecionada
  );

  localStorage.setItem(
    "valorCorrida",
    valorSelecionado
  );

  alert(
    "Corrida selecionada!\n\n" +
    "Origem: " + origem + "\n" +
    "Destino: " + destino + "\n" +
    "Categoria: " + categoriaSelecionada + "\n" +
    "Valor estimado: R$ " +
    valorSelecionado.toFixed(2).replace(".", ",")
  );
}


// =========================
// COMPARTILHAR CORRIDA
// =========================

function compartilharCorrida() {
  const origem =
    localStorage.getItem("origemCorrida") ||
    "Não informada";

  const destino =
    localStorage.getItem("destinoCorrida") ||
    "Não informado";

  const texto =
    "Minha viagem WN57\n\n" +
    "Origem: " + origem + "\n" +
    "Destino: " + destino;

  if (navigator.share) {
    navigator.share({
      title: "Minha corrida WN57",
      text: texto
    });
  } else {
    alert(texto);
  }
}

//nao consiguir fazer corrida se na logar//

    const usuarioLogado = localStorage.getItem("usuarioLogado");
    const mensagemLogin = document.getElementById("mensagemLogin");

    if (usuarioLogado) {
        mensagemLogin.style.display = "none";
    }

    function irParaLogin() {
        window.location.href = "login.html";
    }
