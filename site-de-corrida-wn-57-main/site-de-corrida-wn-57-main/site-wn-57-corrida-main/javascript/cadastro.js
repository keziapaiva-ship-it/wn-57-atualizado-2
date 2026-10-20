const form = document.querySelector("form");

const nome = document.getElementById("nome");
const email = document.getElementById("email");
const telefone = document.getElementById("telefone");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmacao-Senha");

// 🔐 validações
function validarEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function validarSenhaForte(senha) {
  return senha.length >= 6 && /\d/.test(senha);
}

function mostrarErro(msg) {
  alert(msg);
}

// 🎨 mantém seu visual de senha (NÃO ALTERA CSS)
function validarSenhas() {
  const senhaValor = senha.value;
  const confirmarValor = confirmarSenha.value;

  if (senhaValor.length >= 6) {
    senha.classList.add("input-certo");
    senha.classList.remove("input-erro");
  } else {
    senha.classList.add("input-erro");
    senha.classList.remove("input-certo");
  }

  if (confirmarValor.length > 0) {
    if (senhaValor === confirmarValor) {
      confirmarSenha.classList.add("input-certo");
      confirmarSenha.classList.remove("input-erro");
    } else {
      confirmarSenha.classList.add("input-erro");
      confirmarSenha.classList.remove("input-certo");
    }
  }
}

// eventos visuais (mantido)
senha.addEventListener("input", validarSenhas);
confirmarSenha.addEventListener("input", validarSenhas);

// 🚀 UM ÚNICO SUBMIT (corrigido)
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const dados = {
    nome: nome.value.trim(),
    email: email.value.trim(),
    telefone: telefone.value.replace(/\D/g, ""),
    senha: senha.value
  };

  // validações
  if (dados.nome.length < 3) {
    return mostrarErro("Digite um nome válido");
  }

  if (!validarEmail(dados.email)) {
    return mostrarErro("Digite um e-mail válido");
  }

  if (!validarSenhaForte(dados.senha)) {
    return mostrarErro("Senha fraca (mínimo 6 caracteres + número)");
  }

  if (dados.senha !== confirmarSenha.value) {
    return mostrarErro("As senhas não coincidem");
  }

  // salvar usuários
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const existe = usuarios.find(u => u.email === dados.email);

  if (existe) {
    return mostrarErro("Esse e-mail já está cadastrado");
  }

  usuarios.push(dados);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  // feedback visual sem quebrar design
  const btn = form.querySelector("button");
  btn.innerText = "Criando conta...";
  btn.disabled = true;

  setTimeout(() => {
    alert("Cadastro realizado com sucesso!");
    window.location.href = "/html/login.html";
  }, 800);
});


//nao ver a senha//
const toggleSenha = document.getElementById("toggleSenha");

if (toggleSenha) {
  toggleSenha.addEventListener("click", () => {
    const tipo = senha.type === "password" ? "text" : "password";
    senha.type = tipo;

    toggleSenha.textContent = tipo === "password" ? "👁" : "👁‍🗨";
  });
}
