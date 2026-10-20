const form = document.getElementById("loginForm");
const emailLogin = document.getElementById("email");
const senhaLogin = document.getElementById("senha");
const erro = document.getElementById("erroLogin");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailLogin.value.trim();
    const senha = senhaLogin.value.trim();

    if (!email || !senha) {
        erro.textContent = "Preencha o e-mail e a senha.";
        return;
    }

    // Pega os dados cadastrados
    const cadastro = JSON.parse(localStorage.getItem("usuario"));

    // Se existir cadastro, pega o nome
    const nome = cadastro?.nome || email.split("@")[0];

    // Salva o usuário logado
    const usuarioLogado = {
        nome: nome,
        email: email,
        foto: cadastro?.foto || "https://i.pravatar.cc/150?img=12"
    };

    localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuarioLogado)
    );

    alert("Login realizado com sucesso!");

    window.location.href =
        "/site-de-corrida-wn-57-main/site-wn-57-corrida-main/html/solicitar.html";
});