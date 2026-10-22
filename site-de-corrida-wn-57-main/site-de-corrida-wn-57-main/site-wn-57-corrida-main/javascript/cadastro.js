"use strict";

/* =====================================================
   E-MAIL DE BOAS-VINDAS NO CADASTRO (via EmailJS)
   Funciona sem servidor próprio.
====================================================== */

const EMAIL_CONFIG = {
  PUBLIC_KEY: "COLE_SUA_PUBLIC_KEY_AQUI",   // EmailJS > Account > API keys
  SERVICE_ID: "COLE_SEU_SERVICE_ID_AQUI",   // EmailJS > Email Services
  TEMPLATE_ID: "COLE_SEU_TEMPLATE_ID_AQUI"  // EmailJS > Email Templates
};

if (window.emailjs) {
  emailjs.init({ publicKey: EMAIL_CONFIG.PUBLIC_KEY });
}

/**
 * Envia o e-mail de boas-vindas depois que o cadastro é concluído.
 * Nunca trava o cadastro: se o e-mail falhar, só registra no console.
 *
 * @param {{nome: string, email: string}} usuario
 */
async function enviarEmailCadastro(usuario) {
  try {
    if (!window.emailjs) throw new Error("Biblioteca do EmailJS não carregou.");
    if (!usuario || !usuario.email) return;

    const agora = new Date().toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    });

    // Variáveis usadas no modelo do e-mail: {{nome}}, {{para_email}} e {{data_hora}}
    await emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, {
      nome: usuario.nome || "cliente",
      para_email: usuario.email,
      data_hora: agora
    });
  } catch (erro) {
    console.error("Não foi possível enviar o e-mail de boas-vindas:", erro);
  }
}


/* =====================================================
   IDIOMA (PT-BR / EN)
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const btnIdioma = document.getElementById("btnIdioma");

  if (!btnIdioma) {
    console.error("Botão de idioma não encontrado!");
    return;
  }

  const LOGIN_URL = "/site-de-corrida-wn-57-main/site-wn-57-corrida-main/html/login/login.html";

  const traducoes = {
    "pt-BR": {
      tituloPagina: "Criar conta - WN57",
      botaoIdioma: "🌐 PT-BR",
      ajuda: "Ajuda",
      login: "Fazer login",
      sair: "Sair",
      ola: "Olá",
      titulo: "Crie sua conta",
      subtitulo: "Preencha seus dados para viajar com a WN57.",
      divisor: "ou cadastre-se com seus dados",
      nome: "Nome completo",
      nomePlaceholder: "Ex.: Maria da Silva",
      email: "E-mail",
      emailPlaceholder: "voce@email.com",
      nascimento: "Data de nascimento",
      nascimentoPlaceholder: "dd/mm/aaaa",
      telefone: "Telefone",
      telefonePlaceholder: "(11) 99999-9999",
      senha: "Senha",
      senhaPlaceholder: "Crie uma senha",
      confirmarSenha: "Confirmar senha",
      confirmarSenhaPlaceholder: "Repita a senha",
      dicaSenha: "Use 8 ou mais caracteres, com letra maiúscula, minúscula, número e símbolo.",
      criarConta: "Criar conta",
      termos: 'Ao criar a conta, você concorda com os <a href="#">Termos de uso</a> e a <a href="#">Política de privacidade</a>.',
      jaTemConta: 'Já tem uma conta? <a href="' + LOGIN_URL + '">Entrar</a>'
    },

    "en": {
      tituloPagina: "Create Account - WN57",
      botaoIdioma: "🌐 EN",
      ajuda: "Help",
      login: "Log in",
      sair: "Log out",
      ola: "Hi",
      titulo: "Create your account",
      subtitulo: "Enter your details to travel with WN57.",
      divisor: "or sign up with your details",
      nome: "Full name",
      nomePlaceholder: "E.g., Maria da Silva",
      email: "Email",
      emailPlaceholder: "you@email.com",
      nascimento: "Date of birth",
      nascimentoPlaceholder: "DD/MM/YYYY",
      telefone: "Phone number",
      telefonePlaceholder: "(11) 99999-9999",
      senha: "Password",
      senhaPlaceholder: "Create a password",
      confirmarSenha: "Confirm password",
      confirmarSenhaPlaceholder: "Repeat your password",
      dicaSenha: "Use 8 or more characters, including uppercase and lowercase letters, a number, and a symbol.",
      criarConta: "Create account",
      termos: 'By creating an account, you agree to the <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.',
      jaTemConta: 'Already have an account? <a href="' + LOGIN_URL + '">Log in</a>'
    }
  };

  function trocarIdioma(idioma) {
    const t = traducoes[idioma];
    if (!t) return;

    // Idioma do documento
    document.documentElement.lang = idioma === "en" ? "en" : "pt-BR";
    document.title = t.tituloPagina;

    // Botão de idioma
    btnIdioma.textContent = t.botaoIdioma;

    // Menu superior
    const linksMenu = document.querySelectorAll("header .menu-direita > a");
    if (linksMenu[0]) linksMenu[0].textContent = t.ajuda;

    // "Fazer login" (só existe quando NÃO há usuário logado)
    const linkLogin = document.querySelector("#usuarioArea a[data-login]");
    if (linkLogin) linkLogin.textContent = t.login;

    // Textos do usuário logado
    const ola = document.querySelector("#usuarioArea [data-ola]");
    if (ola) ola.textContent = t.ola + ", " + (ola.dataset.nome || "");
    const sair = document.querySelector("#usuarioArea [data-sair]");
    if (sair) sair.textContent = t.sair;

    // Título e subtítulo
    definirTexto(".sessao-topo h1", t.titulo);
    definirTexto(".sessao-topo p", t.subtitulo);
    definirTexto(".divisor span", t.divisor);

    // Campos do formulário
    definirTexto('label[for="nome"]', t.nome);
    definirTexto('label[for="email"]', t.email);
    definirTexto('label[for="date"]', t.nascimento);
    definirTexto('label[for="telefone"]', t.telefone);
    definirTexto('label[for="senha"]', t.senha);
    definirTexto('label[for="confirmacao-senha"]', t.confirmarSenha);

    definirPlaceholder("#nome", t.nomePlaceholder);
    definirPlaceholder("#email", t.emailPlaceholder);
    definirPlaceholder("#date", t.nascimentoPlaceholder);
    definirPlaceholder("#telefone", t.telefonePlaceholder);
    definirPlaceholder("#senha", t.senhaPlaceholder);
    definirPlaceholder("#confirmacao-senha", t.confirmarSenhaPlaceholder);

    // Dica de senha
    definirTexto(".dica-senha", t.dicaSenha);

    // Botão de cadastro
    definirTexto(".btn-enviar", t.criarConta);

    // Textos com links
    definirHTML(".termos", t.termos);
    definirHTML(".ja-tem-conta", t.jaTemConta);

    // Salva a preferência escolhida
    localStorage.setItem("idiomaWN57", idioma);
  }

  function definirTexto(seletor, texto) {
    const elemento = document.querySelector(seletor);
    if (elemento) elemento.textContent = texto;
  }

  function definirPlaceholder(seletor, texto) {
    const elemento = document.querySelector(seletor);
    if (elemento) elemento.placeholder = texto;
  }

  function definirHTML(seletor, html) {
    const elemento = document.querySelector(seletor);
    if (elemento) elemento.innerHTML = html;
  }

  // Alterna entre português e inglês
  btnIdioma.addEventListener("click", () => {
    const idiomaAtual = document.documentElement.lang.toLowerCase();
    trocarIdioma(idiomaAtual.startsWith("en") ? "pt-BR" : "en");
  });

  // Recupera o idioma escolhido anteriormente
  const idiomaSalvo = localStorage.getItem("idiomaWN57");
  trocarIdioma(idiomaSalvo === "en" ? "en" : "pt-BR");
});

