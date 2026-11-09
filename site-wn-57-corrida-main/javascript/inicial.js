console.log("JavaScript carregado!");

const topBtn = document.getElementById("topBtn");

if (topBtn) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            topBtn.classList.add("show");
        } else {
            topBtn.classList.remove("show");
        }
    });

    topBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


// ===== IDIOMA (PT-BR / EN) =====
// [seletor, posição, texto em inglês]
const traducoes = [
    // Menu
    ["nav a", 0, "Home"],
    ["nav a", 1, "Ride"],
    ["nav a", 2, "Activity"],
    ["nav a", 3, "About us"],
    [".header-right a", 0, "Help"],
    [".header-right a", 1, "Log in"],
    [".header-right a", 2, "Sign up"],

    // Hero
    [".hero h1", 0, 'Your <span>premium</span> ride'],
    [".hero-text p", 0, "A modern, fast and secure app. Travel comfortably with an extraordinary experience."],
    [".hero-buttons a", 0, "Request a ride"],
    [".hero-buttons a", 1, "How it works"],

    // Card do celular
    [".ride-card > p", 0, "Driver arriving • 3 min"],
    [".ride-card button", 0, "Confirm ride"],

    // Estatísticas
    [".stat-box p", 0, "Rides completed"],
    [".stat-box p", 1, "User rating"],
    [".stat-box p", 2, "Active drivers"],

    // Features
    [".section-title h2", 0, "Why use WN57?"],
    [".section-title p", 0, "Modern, elegant and safe mobility."],
    [".feature-card h3", 0, "Fast rides"],
    [".feature-card p", 0, "Nearby drivers in just a few seconds."],
    [".feature-card h3", 1, "Real-time map"],
    [".feature-card p", 1, "See your route live with modern GPS."],
    [".feature-card h3", 2, "More safety"],
    [".feature-card p", 2, "Verified drivers and 24/7 support."],
    [".feature-card h3", 3, "Easy payment"],
    [".feature-card p", 3, "PIX, card or cash."],

    // Tipos de corrida
    [".ride-option p", 0, "Luxury and premium comfort."],
    [".ride-option p", 1, "More comfortable rides."],
    [".ride-option h3", 2, "WN Economy"],
    [".ride-option p", 2, "Fast and affordable rides."],

    // Avaliações
    [".review p", 0, "“Very beautiful and fast app. The experience feels like an international app.”"],
    [".review p", 1, "“Amazing map and very polite drivers.”"],
    [".review p", 2, "“Premium and very modern look.”"],

    // Download
    [".download h2", 0, "Download the WN57 app"],
    [".download p", 0, "Request your ride in seconds with a modern, fast and secure platform."],
    [".download button", 0, "Download"],

    // Rodapé
    ["footer", 0, "© 2026 WN57 • All rights reserved"],

    // Cookies
    [".cookie-texto h3", 0, "We use cookies"],
    [".cookie-texto p", 0, 'We use cookies to improve your browsing experience. By accepting, you agree to the <strong>Privacy Policy</strong> and <strong>Cookie Policy</strong> of WN57.'],
    [".cookie-aceitar", 0, "Accept"],
    [".cookie-recusar", 0, "Decline"]
];

const idiomaBtn = document.querySelector(".idioma-btn");
const textosOriginais = new Map(); // guarda o português original de cada elemento

function aplicarIdioma(lang) {
    traducoes.forEach(([seletor, posicao, textoEN]) => {
        const el = document.querySelectorAll(seletor)[posicao];
        if (!el) return;

        // guarda o texto em português na primeira vez
        if (!textosOriginais.has(el)) {
            textosOriginais.set(el, el.innerHTML);
        }

        el.innerHTML = lang === "en" ? textoEN : textosOriginais.get(el);
    });

    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    if (idiomaBtn) idiomaBtn.textContent = lang === "en" ? "🌐 EN" : "🌐 PT-BR";
    localStorage.setItem("idioma", lang);
}

if (idiomaBtn) {
    // aplica o idioma salvo (ou português por padrão)
    aplicarIdioma(localStorage.getItem("idioma") || "pt");

    // cada clique alterna entre os dois idiomas
    idiomaBtn.addEventListener("click", () => {
        const atual = localStorage.getItem("idioma") || "pt";
        aplicarIdioma(atual === "pt" ? "en" : "pt");
    });
}

// ===== COOKIES =====
const cookieBanner = document.getElementById("cookieBanner");
const aceitarCookie = document.getElementById("aceitarCookie");
const recusarCookie = document.getElementById("recusarCookie");
const fecharCookie = document.getElementById("fecharCookie");

function esconderCookies(escolha) {
    cookieBanner.classList.add("esconder");
    // lembra a escolha para o aviso não voltar a cada visita
    try { localStorage.setItem("wn57_cookies", escolha); } catch (e) { }
}

// se a pessoa já escolheu antes, o aviso nem aparece
try {
    if (localStorage.getItem("wn57_cookies")) cookieBanner.classList.add("esconder");
} catch (e) { }

aceitarCookie.addEventListener("click", () => esconderCookies("aceito"));
recusarCookie.addEventListener("click", () => esconderCookies("recusado"));
fecharCookie.addEventListener("click", () => esconderCookies("fechado"));


// ===== PERFIL (login com foto e nome vindos do cadastro) =====
const CHAVE_USUARIO = "usuario";   // mesma chave que o cadastro e o login com Google gravam
const PAGINA_INICIAL = "/site-de-corrida-wn-57-main/site-de-corrida-wn-57-main/site-wn-57-corrida-main/html/inicial.html";

document.addEventListener("DOMContentLoaded", () => {
    const perfil = document.getElementById("perfil");
    const perfilBtn = document.getElementById("perfilBtn");
    const perfilMenu = document.getElementById("perfilMenu");
    const perfilNome = document.getElementById("perfilNome");
    const perfilNomeCurto = document.getElementById("perfilNomeCurto");
    const avatarMini = document.getElementById("avatarMini");
    const perfilFoto = document.getElementById("perfilFoto");
    const perfilSair = document.getElementById("perfilSair");

    // Verifica se os elementos existem nesta página
    if (!perfil || !perfilBtn || !perfilMenu) return;

    // Lê o usuário salvo pelo cadastro (ou pelo login com Google)
    let usuario = null;
    try {
        usuario = JSON.parse(localStorage.getItem(CHAVE_USUARIO));
    } catch (erro) {
        console.error("Erro ao ler o usuário:", erro);
    }

    // Sem usuário: continua aparecendo Fazer login / Cadastre-se
    if (!usuario || !usuario.nome) {
        document.documentElement.classList.remove("logado");
        return;
    }

    // Com usuário: mostra o perfil e esconde Fazer login / Cadastre-se
    document.documentElement.classList.add("logado");

    // garante que o menu possa abrir, mesmo se sobrou CSS antigo com "display: none"
    perfilMenu.style.display = "block";

    const nome = usuario.nome.trim();
    const primeiroNome = nome.split(" ")[0];
    const inicial = nome.charAt(0).toUpperCase();

    perfilNome.textContent = nome;
    perfilNomeCurto.textContent = primeiroNome;
    avatarMini.textContent = inicial;
    perfilFoto.textContent = inicial;

    // Se tiver foto (escolhida no cadastro ou do Google), mostra a imagem
    if (usuario.foto) {
        const url = `url("${String(usuario.foto).replace(/"/g, "%22")}")`;

        [avatarMini, perfilFoto].forEach((el) => {
            el.textContent = "";
            el.style.backgroundImage = url;
            el.style.backgroundSize = "cover";
            el.style.backgroundPosition = "center";
        });
    }

    // Abre e fecha o menu
    function alternarMenu(abrir) {
        const aberto = abrir ?? !perfilMenu.classList.contains("aberto");
        perfilMenu.classList.toggle("aberto", aberto);
        perfilBtn.setAttribute("aria-expanded", String(aberto));
    }

    perfilBtn.addEventListener("click", (evento) => {
        evento.stopPropagation();
        alternarMenu();
    });

    // Clicar dentro do menu não fecha
    perfilMenu.addEventListener("click", (evento) => evento.stopPropagation());

    // Fecha ao clicar fora ou apertar Esc
    document.addEventListener("click", () => alternarMenu(false));
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") alternarMenu(false);
    });

    // Sair: apaga o usuário e volta para a página inicial deslogada
    if (perfilSair) {
        perfilSair.addEventListener("click", () => {
            localStorage.removeItem(CHAVE_USUARIO);
            localStorage.removeItem("usuarioLogado");
            window.location.href = PAGINA_INICIAL;
        });
    }
});

/* ATENÇÃO: o bloco antigo no final do arquivo que criava o usuário
   "Kézia" (const usuario = {...}; localStorage.setItem("usuarioLogado", ...))
   foi REMOVIDO. Era ele que deixava a pessoa sempre logada. */