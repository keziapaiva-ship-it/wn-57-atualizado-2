"use strict";

/* =====================================================
   01. CONFIGURAÇÃO
   Quando tiver um servidor, troque MODO_DEMO para false.
====================================================== */

const CONFIG = {
  MODO_DEMO: true,                 // true = salva no navegador (só para testes)
  API_URL: "/enviar-dados",        // rota do servidor (POST, JSON, sempre via HTTPS)
  PAGINA_LOGIN: "/site-de-corrida-wn-57-main/site-wn-57-corrida-main/html/login.html",
  IDADE_MINIMA: 18,
  SENHA_MIN: 8,
  ITERACOES_HASH: 210000,          // PBKDF2 (modo demo)
  TENTATIVAS_MAX: 5,               // falhas seguidas antes de bloquear
  BLOQUEIO_MS: 30000,              // tempo de bloqueio (30 s)
  TIMEOUT_MS: 10000                // tempo máximo da requisição
};


/* =====================================================
   02. ELEMENTOS DA PÁGINA
====================================================== */

const form = document.querySelector("form");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoNascimento = document.getElementById("date");
const campoTelefone = document.getElementById("telefone");
const campoSenha = document.getElementById("senha");
const campoConfirmar = document.getElementById("confirmacao-senha");
const botaoEnviar = form.querySelector('button[type="submit"]');

let tentativasFalhas = 0;
let bloqueadoAte = 0;
let enviando = false;


/* =====================================================
   03. LIMPEZA DE TEXTO
====================================================== */

function limparTexto(texto) {
  return String(texto)
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F<>]/g, "") // remove controle e < >
    .replace(/\s+/g, " ")
    .trim();
}


/* =====================================================
   04. VALIDAÇÕES (retornam "" se OK, ou a mensagem de erro)
====================================================== */

function validarNome(valor) {
  const nome = limparTexto(valor);
  if (nome.length < 3) return "Digite seu nome completo.";
  if (nome.length > 100) return "Nome muito longo.";
  if (!/^\p{L}+(?:[ '\-]\p{L}+)+$/u.test(nome)) {
    return "Use nome e sobrenome, apenas com letras.";
  }
  return "";
}

function validarEmail(valor) {
  const email = valor.trim().toLowerCase();
  if (!email) return "Digite seu e-mail.";
  if (email.length > 254) return "E-mail muito longo.";
  const regex = /^[a-z0-9._%+\-]+@[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?)+$/;
  if (!regex.test(email) || email.includes("..")) return "Digite um e-mail válido.";
  return "";
}

function validarTelefone(valor) {
  const numeros = valor.replace(/\D/g, "");
  if (numeros.length < 10 || numeros.length > 11) return "Digite DDD + número.";
  const ddd = Number(numeros.slice(0, 2));
  if (ddd < 11 || ddd > 99) return "DDD inválido.";
  if (numeros.length === 11 && numeros[2] !== "9") return "Celular deve começar com 9.";
  return "";
}

function calcularIdade(dataISO) {
  const nasc = new Date(dataISO + "T00:00:00");
  if (Number.isNaN(nasc.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const jaFezAniversario =
    hoje.getMonth() > nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() >= nasc.getDate());
  if (!jaFezAniversario) idade--;
  return idade;
}

function validarNascimento(valor) {
  if (!valor) return "Informe a data de nascimento.";
  const idade = calcularIdade(valor);
  if (idade === null) return "Data inválida.";
  if (idade < 0) return "A data não pode estar no futuro.";
  if (idade > 120) return "Data inválida.";
  if (idade < CONFIG.IDADE_MINIMA) {
    return `É preciso ter ${CONFIG.IDADE_MINIMA} anos ou mais.`;
  }
  return "";
}

const SENHAS_COMUNS = [
  "12345678", "123456789", "1234567890", "senha123", "password",
  "qwertyui", "qwerty123", "abc12345", "11111111", "iloveyou",
  "admin123", "brasil123", "senha1234", "mudar123"
];

function avaliarSenha(senha) {
  const regras = {
    tamanho: senha.length >= CONFIG.SENHA_MIN,
    minuscula: /[a-z]/.test(senha),
    maiuscula: /[A-Z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[^A-Za-z0-9]/.test(senha)
  };
  let pontos = Object.values(regras).filter(Boolean).length;
  if (senha.length >= 12) pontos++;
  const niveis = ["Muito fraca", "Fraca", "Média", "Boa", "Forte", "Excelente"];
  return { regras, pontos, rotulo: niveis[Math.min(pontos, 5)] };
}

function validarSenha(valor) {
  if (valor.length < CONFIG.SENHA_MIN) {
    return `Use pelo menos ${CONFIG.SENHA_MIN} caracteres.`;
  }
  if (valor.length > 128) return "Senha muito longa (máx. 128).";
  const { regras } = avaliarSenha(valor);
  if (!regras.minuscula || !regras.maiuscula) return "Misture letras maiúsculas e minúsculas.";
  if (!regras.numero) return "Inclua pelo menos um número.";
  if (!regras.especial) return "Inclua um símbolo (ex.: ! @ # $).";
  if (SENHAS_COMUNS.includes(valor.toLowerCase())) return "Essa senha é muito comum.";

  const baixa = valor.toLowerCase();
  const parteEmail = campoEmail.value.split("@")[0].toLowerCase();
  if (parteEmail.length >= 4 && baixa.includes(parteEmail)) {
    return "A senha não pode conter seu e-mail.";
  }
  const primeiroNome = limparTexto(campoNome.value).split(" ")[0].toLowerCase();
  if (primeiroNome.length >= 4 && baixa.includes(primeiroNome)) {
    return "A senha não pode conter seu nome.";
  }
  return "";
}

function validarConfirmacao(valor) {
  if (!valor) return "Confirme sua senha.";
  if (valor !== campoSenha.value) return "As senhas não coincidem.";
  return "";
}


/* =====================================================
   05. MENSAGENS NA TELA (erro / ok)
====================================================== */

function obterMsg(input) {
  let msg = input.parentElement.querySelector(".erro-msg");
  if (!msg) {
    const alvo = input.closest(".campo-senha") || input;
    msg = document.createElement("small");
    msg.className = "erro-msg";
    msg.id = `${input.id}-erro`;
    msg.setAttribute("role", "alert");
    alvo.insertAdjacentElement("afterend", msg);
    input.setAttribute("aria-describedby", msg.id);
  }
  return msg;
}

function mostrarCampo(input, mensagem) {
  const msg = obterMsg(input);
  if (mensagem) {
    input.classList.add("input-erro");
    input.classList.remove("input-certo");
    input.setAttribute("aria-invalid", "true");
    msg.textContent = mensagem;
  } else {
    input.classList.remove("input-erro");
    input.classList.add("input-certo");
    input.setAttribute("aria-invalid", "false");
    msg.textContent = "";
  }
  return !mensagem;
}

const CAMPOS = [
  { input: campoNome, validar: validarNome },
  { input: campoEmail, validar: validarEmail },
  { input: campoNascimento, validar: validarNascimento },
  { input: campoTelefone, validar: validarTelefone },
  { input: campoSenha, validar: validarSenha },
  { input: campoConfirmar, validar: validarConfirmacao }
];

function validarCampo(item) {
  return mostrarCampo(item.input, item.validar(item.input.value));
}


/* =====================================================
   06. MÁSCARA DO TELEFONE  (11) 99999-9999
====================================================== */

campoTelefone.setAttribute("inputmode", "tel");
campoTelefone.setAttribute("maxlength", "15");

campoTelefone.addEventListener("input", () => {
  let n = campoTelefone.value.replace(/\D/g, "").slice(0, 11);
  if (n.length > 10) n = n.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  else if (n.length > 6) n = n.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  else if (n.length > 2) n = n.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  else if (n.length > 0) n = n.replace(/^(\d{0,2})/, "($1");
  campoTelefone.value = n;
});


/* =====================================================
   07. CAMPOS DE SENHA: mostrar/esconder + medidor de força
====================================================== */

function criarBotaoOlho(input) {
  const envoltorio = document.createElement("span");
  envoltorio.className = "campo-senha";
  input.parentElement.insertBefore(envoltorio, input);
  envoltorio.appendChild(input);

  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "toggle-senha";
  botao.setAttribute("aria-label", "Mostrar senha");
  botao.textContent = "👁";
  envoltorio.appendChild(botao);

  botao.addEventListener("click", () => {
    const mostrar = input.type === "password";
    input.type = mostrar ? "text" : "password";
    botao.textContent = mostrar ? "🙈" : "👁";
    botao.setAttribute("aria-label", mostrar ? "Esconder senha" : "Mostrar senha");
  });
}

criarBotaoOlho(campoSenha);
criarBotaoOlho(campoConfirmar);

// Atributos de segurança e usabilidade
campoSenha.setAttribute("autocomplete", "new-password");
campoConfirmar.setAttribute("autocomplete", "new-password");
campoSenha.setAttribute("maxlength", "128");
campoConfirmar.setAttribute("maxlength", "128");
campoNome.setAttribute("autocomplete", "name");
campoNome.setAttribute("maxlength", "100");
campoEmail.setAttribute("autocomplete", "email");
campoEmail.setAttribute("maxlength", "254");
campoTelefone.setAttribute("autocomplete", "tel");

// Data máxima = hoje
campoNascimento.max = new Date().toISOString().split("T")[0];

// Medidor de força
const medidor = document.createElement("div");
medidor.className = "forca-senha";
medidor.innerHTML = '<div class="forca-barra"><span></span></div><small class="forca-texto"></small>';
campoSenha.closest(".campo-senha").insertAdjacentElement("afterend", medidor);

function atualizarMedidor() {
  const barra = medidor.querySelector(".forca-barra span");
  const texto = medidor.querySelector(".forca-texto");
  if (!campoSenha.value) {
    barra.style.width = "0";
    texto.textContent = "";
    return;
  }
  const { pontos, rotulo } = avaliarSenha(campoSenha.value);
  const cores = ["#e74c3c", "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#27ae60"];
  const indice = Math.min(pontos, 5);
  barra.style.width = `${((indice + 1) / 6) * 100}%`;
  barra.style.background = cores[indice];
  texto.textContent = `Força: ${rotulo}`;
}


/* =====================================================
   08. EVENTOS DE VALIDAÇÃO AO DIGITAR
====================================================== */

CAMPOS.forEach((item) => {
  item.input.addEventListener("blur", () => validarCampo(item));
  item.input.addEventListener("input", () => {
    // Só revalida enquanto digita se o campo já tinha erro
    if (item.input.classList.contains("input-erro")) validarCampo(item);
  });
});

campoSenha.addEventListener("input", () => {
  atualizarMedidor();
  if (campoConfirmar.value) validarCampo(CAMPOS[5]);
});


/* =====================================================
   09. PROTEÇÃO ANTI-ROBÔ (campo isca invisível)
====================================================== */

const isca = document.createElement("input");
isca.type = "text";
isca.name = "website";
isca.tabIndex = -1;
isca.autocomplete = "off";
isca.setAttribute("aria-hidden", "true");
isca.className = "campo-isca";
form.appendChild(isca);


/* =====================================================
   10. STATUS GERAL DO FORMULÁRIO
====================================================== */

const status = document.createElement("div");
status.id = "cadastro-status";
status.setAttribute("role", "status");
status.setAttribute("aria-live", "polite");
botaoEnviar.insertAdjacentElement("beforebegin", status);

function mostrarStatus(texto, tipo) {
  status.textContent = texto;
  status.className = tipo ? `status-${tipo}` : "";
}


/* =====================================================
   11. HASH DA SENHA (somente MODO_DEMO)
   Em produção o hash é feito no servidor (Argon2 ou bcrypt).
====================================================== */

function paraBase64(bytes) {
  let binario = "";
  bytes.forEach((b) => (binario += String.fromCharCode(b)));
  return btoa(binario);
}

async function gerarHash(senha) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const chave = await crypto.subtle.importKey("raw", enc.encode(senha), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: CONFIG.ITERACOES_HASH, hash: "SHA-256" },
    chave,
    256
  );
  return {
    senhaHash: paraBase64(new Uint8Array(bits)),
    salt: paraBase64(salt),
    iteracoes: CONFIG.ITERACOES_HASH
  };
}


/* =====================================================
   12. SALVAR O CADASTRO
====================================================== */

async function salvarNoNavegador(dados) {
  // Modo demo: NÃO é seguro para produção.
  let usuarios = [];
  try {
    usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  } catch {
    usuarios = [];
  }

  if (usuarios.some((u) => u.email === dados.email)) {
    throw new Error("Esse e-mail já está cadastrado.");
  }

  const credenciais = await gerarHash(dados.senha);
  const { senha, ...semSenha } = dados; // a senha pura nunca é guardada
  usuarios.push({ ...semSenha, ...credenciais, criadoEm: new Date().toISOString() });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

async function enviarParaServidor(dados) {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), CONFIG.TIMEOUT_MS);

  const headers = { "Content-Type": "application/json" };
  const csrf = document.querySelector('meta[name="csrf-token"]');
  if (csrf) headers["X-CSRF-Token"] = csrf.content;

  try {
    const resposta = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers,
      credentials: "same-origin",
      body: JSON.stringify(dados),
      signal: controle.signal
    });

    if (resposta.status === 409) throw new Error("Esse e-mail já está cadastrado.");
    if (resposta.status === 429) throw new Error("Muitas tentativas. Aguarde um pouco.");
    if (!resposta.ok) throw new Error("Não foi possível concluir o cadastro. Tente novamente.");
  } catch (erro) {
    if (erro.name === "AbortError") throw new Error("O servidor demorou para responder.");
    throw erro;
  } finally {
    clearTimeout(timer);
  }
}


/* =====================================================
   13. ENVIO DO FORMULÁRIO
====================================================== */

function registrarFalha() {
  tentativasFalhas++;
  if (tentativasFalhas >= CONFIG.TENTATIVAS_MAX) {
    bloqueadoAte = Date.now() + CONFIG.BLOQUEIO_MS;
    tentativasFalhas = 0;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (enviando) return;

  // Robô preencheu o campo isca: ignora em silêncio
  if (isca.value) return;

  // Bloqueio temporário após muitas falhas
  if (Date.now() < bloqueadoAte) {
    const seg = Math.ceil((bloqueadoAte - Date.now()) / 1000);
    mostrarStatus(`Muitas tentativas. Aguarde ${seg}s.`, "erro");
    return;
  }

  // Valida todos os campos
  const resultados = CAMPOS.map(validarCampo);
  if (resultados.includes(false)) {
    registrarFalha();
    mostrarStatus("Corrija os campos destacados.", "erro");
    CAMPOS[resultados.indexOf(false)].input.focus();
    return;
  }

  const dados = {
    nome: limparTexto(campoNome.value),
    email: campoEmail.value.trim().toLowerCase(),
    telefone: campoTelefone.value.replace(/\D/g, ""),
    nascimento: campoNascimento.value,
    senha: campoSenha.value
  };

  enviando = true;
  botaoEnviar.disabled = true;
  botaoEnviar.textContent = "Criando conta...";
  mostrarStatus("", "");

  try {
    if (CONFIG.MODO_DEMO) await salvarNoNavegador(dados);
    else await enviarParaServidor(dados);

    mostrarStatus("Cadastro realizado com sucesso!", "ok");
    form.reset();
    setTimeout(() => (window.location.href = CONFIG.PAGINA_LOGIN), 1000);
  } catch (erro) {
    registrarFalha();
    mostrarStatus(erro.message || "Erro inesperado. Tente novamente.", "erro");
    botaoEnviar.disabled = false;
    botaoEnviar.textContent = "Cadastrar";
    enviando = false;
  } finally {
    // Limpa a senha da memória do formulário
    dados.senha = "";
  }
});