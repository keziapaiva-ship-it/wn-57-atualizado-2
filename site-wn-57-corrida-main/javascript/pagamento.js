function mostrarPix(){
    const pix = document.getElementById("pixArea");
    pix.style.display = "block";
}

function escolherCartao(){
    localStorage.setItem("pagamento", "Cartão");
}

function salvarCartao(){
    const numero = document.querySelector('input[placeholder="Número do cartão"]').value;
    const validade = document.querySelector('input[placeholder="Validade"]').value;
    const cvv = document.querySelector('input[placeholder="CVV"]').value;
    const nome = document.querySelector('input[placeholder="Nome no cartão"]').value;

    const cartao = {
        numero,
        validade,
        cvv,
        nome
    };

    localStorage.setItem("cartao", JSON.stringify(cartao));
}

function finalizarPagamento() {

    salvarCartao();

    // efeito de carregamento simples
    const botao = document.querySelector(".finalizar");
    botao.innerText = "Processando pagamento...";

    setTimeout(() => {

        alert("Pagamento realizado com sucesso! ✅");

        window.location.href = "/html/pagamentorealizado.html";

    }, 1500);
}

const valor = localStorage.getItem("valorCorrida");



document.addEventListener("DOMContentLoaded", function () {

    // esconder PIX ao iniciar
    const pixArea = document.getElementById("pixArea");
    pixArea.style.display = "none";

});

