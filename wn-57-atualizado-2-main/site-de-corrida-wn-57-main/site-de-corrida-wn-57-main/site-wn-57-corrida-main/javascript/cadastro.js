"use strict";

/* =====================================================
   CADASTRO WN57
   - Validação dos campos (nome, e-mail, data, telefone, senha)
   - Botão de olho nas senhas e medidor de força
   - Envia o e-mail de boas-vindas (enviarEmailCadastro, do email-cadastro.js)

   IMPORTANTE: o arquivo email-cadastro.js precisa ser carregado ANTES
   deste, como já está no cadastro.html.
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".sessao form");
  if (!form) return;

  const campos = {
    nome: document.getElementById("nome"),
    email: document.getElementById("email"),
    data: document.getElementById("date"),
    telefone: document.getElementById("telefone"),
    senha: document.getElementById("senha"),
    confirmacao: document.getElementById("confirmacao-senha")
  };

  const btnEnviar = form.querySelector(".btn-enviar");
  const LOGIN_URL = "/site-de-corrida-wn-57-main/site-de-corrida-wn-57-main/site-wn-57-corrida-main/html/login/login.html";


  /* ---------- Elementos criados pelo JS ---------- */

  // Mensagem de erro embaixo de cada campo
  Object.values(campos).forEach((input) => {
    const aviso = document.createElement("span");
    aviso.className = "erro-msg";
    aviso.setAttribute("aria-live", "polite");
    input.parentElement.appendChild(aviso);
    input._aviso = aviso;
  });

  // Botão de olho nas duas senhas
  [campos.senha, campos.confirmacao].forEach((input) => {
    const caixa = document.createElement("div");
    caixa.className = "campo-senha";
    input.parentElement.insertBefore(caixa, input);
    caixa.appendChild(input);

    const olho = document.createElement("button");
    olho.type = "button";
    olho.className = "toggle-senha";
    olho.textContent = "👁";
    olho.setAttribute("aria-label", "Mostrar ou ocultar senha");
    olho.addEventListener("click", () => {
      input.type = input.type === "password" ? "text" : "password";
    });
    caixa.appendChild(olho);
  });

  // Medidor de força da senha
  const forca = document.createElement("div");
  forca.className = "forca-senha";
  forca.innerHTML =
    '<div class="forca-barra"><span></span></div><span class="forca-texto"></span>';
  campos.senha.closest(".campo-senha").insertAdjacentElement("afterend", forca);
  const forcaBarra = forca.querySelector(".forca-barra span");
  const forcaTexto = forca.querySelector(".forca-texto");

  // Mensagem geral (sucesso / erro)
  const status = document.createElement("p");
  status.id = "cadastro-status";
  status.setAttribute("aria-live", "polite");
  btnEnviar.insertAdjacentElement("afterend", status);

  // Campo isca anti-robô (pessoas não veem; robôs preenchem)
  const isca = document.createElement("input");
  isca.type = "text";
  isca.name = "website";
  isca.tabIndex = -1;
  isca.autocomplete = "off";
  isca.className = "campo-isca";
  isca.setAttribute("aria-hidden", "true");
  form.appendChild(isca);


  /* ---------- Máscaras ---------- */

  campos.data.addEventListener("input", () => {
    const n = campos.data.value.replace(/\D/g, "").slice(0, 8);
    let v = n;
    if (n.length > 4) v = n.slice(0, 2) + "/" + n.slice(2, 4) + "/" + n.slice(4);
    else if (n.length > 2) v = n.slice(0, 2) + "/" + n.slice(2);
    campos.data.value = v;
  });

  campos.telefone.addEventListener("input", () => {
    const n = campos.telefone.value.replace(/\D/g, "").slice(0, 11);
    let v = n;
    if (n.length > 7) v = "(" + n.slice(0, 2) + ") " + n.slice(2, 7) + "-" + n.slice(7);
    else if (n.length > 2) v = "(" + n.slice(0, 2) + ") " + n.slice(2);
    else if (n.length > 0) v = "(" + n;
    campos.telefone.value = v;
  });


  /* ---------- Regras de validação ---------- */

  function dataValida(texto) {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
    if (!m) return false;
    const dia = +m[1], mes = +m[2], ano = +m[3];
    const d = new Date(ano, mes - 1, dia);
    const real = d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
    return real && ano >= 1900 && d <= new Date();
  }

  function pontosSenha(s) {
    return [
      s.length >= 8,
      /[A-Z]/.test(s),
      /[a-z]/.test(s),
      /\d/.test(s),
      /[^A-Za-z0-9]/.test(s)
    ].filter(Boolean).length;
  }

  const regras = {
    nome: (v) =>
      v.trim().split(/\s+/).length >= 2 && v.trim().length >= 5
        ? "" : "Digite seu nome completo.",
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Digite um e-mail válido.",
    data: (v) => (dataValida(v) ? "" : "Use uma data válida no formato dd/mm/aaaa."),
    telefone: (v) => {
      const n = v.replace(/\D/g, "");
      return n.length === 10 || n.length === 11 ? "" : "Digite DDD e número do telefone.";
    },
    senha: (v) =>
      pontosSenha(v) === 5
        ? "" : "Use 8+ caracteres com maiúscula, minúscula, número e símbolo.",
    confirmacao: (v) =>
      v && v === campos.senha.value ? "" : "As senhas não são iguais."
  };

  function validarCampo(chave) {
    const input = campos[chave];
    const erro = regras[chave](input.value);
    input._aviso.textContent = erro;
    input.classList.toggle("input-erro", !!erro);
    input.classList.toggle("input-certo", !erro);
    return !erro;
  }

  // Valida ao sair do campo e corrige ao digitar
  Object.keys(campos).forEach((chave) => {
    campos[chave].addEventListener("blur", () => validarCampo(chave));
    campos[chave].addEventListener("input", () => {
      if (campos[chave].classList.contains("input-erro")) validarCampo(chave);
    });
  });

  // Atualiza o medidor de força
  campos.senha.addEventListener("input", () => {
    const p = pontosSenha(campos.senha.value);
    const niveis = [
      { w: "0%", cor: "transparent", t: "" },
      { w: "20%", cor: "#d93025", t: "Muito fraca" },
      { w: "40%", cor: "#e8710a", t: "Fraca" },
      { w: "60%", cor: "#f9ab00", t: "Média" },
      { w: "80%", cor: "#7cb342", t: "Boa" },
      { w: "100%", cor: "#1e8e3e", t: "Forte" }
    ];
    const n = campos.senha.value ? niveis[p] : niveis[0];
    forcaBarra.style.width = n.w;
    forcaBarra.style.background = n.cor;
    forcaTexto.textContent = n.t;
    if (campos.confirmacao.value) validarCampo("confirmacao");
  });


  /* ---------- Envio ---------- */

  function mostrarStatus(texto, tipo) {
    status.textContent = texto;
    status.className = tipo ? "status-" + tipo : "";
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    // Robô preencheu o campo escondido: ignora sem avisar
    if (isca.value) return;

    const resultados = Object.keys(campos).map(validarCampo);
    if (resultados.includes(false)) {
      mostrarStatus("Confira os campos destacados.", "erro");
      const primeiroErro = form.querySelector(".input-erro");
      if (primeiroErro) primeiroErro.focus();
      return;
    }

    btnEnviar.disabled = true;
    mostrarStatus("Criando sua conta...", "");

    const usuario = {
      nome: campos.nome.value.trim(),
      email: campos.email.value.trim()
    };
    // o handler precisa ser async e ter e.preventDefault() no começo
    const foto = await reduzirFoto(document.getElementById("foto").files[0]);

    localStorage.setItem("usuario", JSON.stringify({
      nome: document.getElementById("nome").value.trim(),
      email: document.getElementById("email").value.trim(),
      telefone: document.getElementById("telefone").value.trim(),
      foto: foto,
      origem: "cadastro"
    }));

    // se você já chama o e-mail de boas-vindas, deixe a chamada aqui, antes do redirecionamento

    window.location.href = PAGINA_INICIAL;
    // ----------------------------------------------------------
    // AQUI entra o salvamento da conta (banco de dados / servidor),
    // quando o site tiver um. Hoje não existe: o formulário não
    // guarda a conta em lugar nenhum, só envia o e-mail de boas-vindas.
    // ----------------------------------------------------------

    // E-mail de boas-vindas (função do email-cadastro.js)
    let resultado;
    if (typeof enviarEmailCadastro === "function") {
      resultado = await Promise.race([
        enviarEmailCadastro(usuario),
        new Promise((ok) => setTimeout(() => ok({ ok: false, erro: "Demorou demais para responder." }), 8000))
      ]);
    } else {
      resultado = { ok: false, erro: "O email-cadastro.js não foi carregado (confira o caminho no cadastro.html)." };
    }

    if (resultado.ok) {
      mostrarStatus("Conta criada! Enviamos um e-mail de boas-vindas para você.", "ok");
      setTimeout(() => {
        window.location.href = LOGIN_URL;
      }, 2500);
    } else {
      // Mostra o motivo na própria tela e NÃO sai da página
      mostrarStatus("O e-mail não foi enviado. Motivo: " + resultado.erro, "erro");
      btnEnviar.disabled = false;
    }
  });
});

"use strict";

/* =====================================================
   E-MAIL DE BOAS-VINDAS NO CADASTRO (via EmailJS)
   Funciona sem servidor próprio.
====================================================== */

const EMAIL_CONFIG = {
  PUBLIC_KEY: "sWsQblN4YlZ-l9Qxg",
  SERVICE_ID: "service_ei7vef8",
  TEMPLATE_ID: "template_0yyxgoe"  // EmailJS > Email Templates > seu template (começa com template_)
};

if (window.emailjs) {
  emailjs.init({ publicKey: EMAIL_CONFIG.PUBLIC_KEY });
}

/**
 * Envia o e-mail de boas-vindas depois que o cadastro é concluído.
 * Nunca trava o cadastro e devolve { ok, erro } para a página mostrar o resultado.
 *
 * Variáveis usadas no template do EmailJS: {{nome}} e {{email}}
 *
 * @param {{nome: string, email: string}} usuario
 * @returns {Promise<{ok: boolean, erro?: string}>}
 */
async function enviarEmailCadastro(usuario) {
  try {
    if (!window.emailjs) {
      throw new Error("A biblioteca do EmailJS não carregou (confira a internet e o <script> no cadastro.html).");
    }
    if (!usuario || !usuario.email) throw new Error("E-mail da pessoa não informado.");

    if (String(EMAIL_CONFIG.TEMPLATE_ID).startsWith("COLE_")) {
      throw new Error("Falta colocar o Template ID no email-cadastro.js.");
    }

    // Usa só o primeiro nome (Maria da Silva vira Maria)
    const primeiroNome = (usuario.nome || "").trim().split(" ")[0] || "cliente";

    const resposta = await emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, {
      nome: primeiroNome,
      email: usuario.email
    });

    console.log("E-mail de boas-vindas enviado para", usuario.email, resposta);
    return { ok: true };
  } catch (erro) {
    const motivo = (erro && (erro.text || erro.message)) || String(erro);
    console.error("Não foi possível enviar o e-mail de boas-vindas:", erro);
    return { ok: false, erro: motivo };
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

  const LOGIN_URL = "/site-de-corrida-wn-57-main/site-de-corrida-wn-57-main/site-wn-57-corrida-main/html/login/login.html";

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

//PERFIL//
const PAGINA_INICIAL = "/site-de-corrida-wn-57-main/site-de-corrida-wn-57-main/site-wn-57-corrida-main/html/inicial.html"; // ajuste

function reduzirFoto(arquivo) {
  return new Promise((resolve) => {
    const padrao = "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f9c6de"/><circle cx="32" cy="25" r="11" fill="#c2185b"/><path d="M10 64c0-14 10-22 22-22s22 8 22 22z" fill="#c2185b"/></svg>');
    if (!arquivo) return resolve(padrao);
    const leitor = new FileReader();
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = c.height = 256;
        const corte = Math.min(img.width, img.height);
        c.getContext("2d").drawImage(img, (img.width - corte) / 2, (img.height - corte) / 2, corte, corte, 0, 0, 256, 256);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(padrao);
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}
const inputFoto = document.getElementById("foto");
const previaFoto = document.getElementById("previaFoto");
const nomeArquivo = document.getElementById("nomeArquivo");

inputFoto.addEventListener("change", () => {
    const arq = inputFoto.files[0];
    if (!arq) return;
    if (!arq.type.startsWith("image/") || arq.size > 5 * 1024 * 1024) {
        alert("Escolha uma imagem (JPG ou PNG) de até 5 MB.");
        inputFoto.value = "";
        return;
    }
    previaFoto.src = URL.createObjectURL(arq);
    nomeArquivo.textContent = arq.name;
});