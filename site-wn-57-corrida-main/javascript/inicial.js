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


// linguagem //

document.addEventListener("DOMContentLoaded", function () {

    const idiomaBtn = document.querySelector(".idioma-btn");

    if (!idiomaBtn) return;

    idiomaBtn.addEventListener("click", function () {

        const escolha = prompt(
            "Escolha o idioma:\n\n1 - English\n2 - Português (Brasil)"
        );

        if (escolha === "1") {

            document.documentElement.lang = "en";
            idiomaBtn.textContent = "🌐 EN";

            // MENU
            document.querySelectorAll("#menu a")[0].textContent = "Home";
            document.querySelectorAll("#menu a")[1].textContent = "Ride";
            document.querySelectorAll("#menu a")[2].textContent = "Activity";
            document.querySelectorAll("#menu a")[3].textContent = "Help";

            document.querySelector("header .btn").textContent = "Sign up";

            // HERO
            document.querySelector(".hero h1").innerHTML =
                'Your <span>premium</span> ride';

            document.querySelector(".hero-text p").textContent =
                "A modern, fast and secure application. Travel comfortably with an extraordinary experience.";

            document.querySelectorAll(".hero-buttons .btn")[0].textContent =
                "Request a ride";

            document.querySelectorAll(".hero-buttons .btn")[1].textContent =
                "How it works";

            // CORRIDA
            document.querySelector(".ride-card h3").textContent =
                "WN57 Comfort";

            document.querySelector(".ride-card > p").textContent =
                "Driver arriving • 3 min";

            document.querySelector(".ride-card h4").textContent =
                "Mariana Silva";

            document.querySelector(".ride-card span").textContent =
                "HB20 • ABC-1234";

            document.querySelector(".ride-card button").textContent =
                "Confirm ride";

            // ESTATÍSTICAS
            const stats = document.querySelectorAll(".stat-box p");

            stats[0].textContent = "Rides completed";
            stats[1].textContent = "User rating";
            stats[2].textContent = "Active drivers";

            // FEATURES
            document.querySelector(".section-title h2").textContent =
                "Why use WN57?";

            document.querySelector(".section-title p").textContent =
                "Modern, elegant and secure mobility.";

            const features = document.querySelectorAll(".feature-card");

            features[0].querySelector("h3").textContent =
                "Fast rides";

            features[0].querySelector("p").textContent =
                "Nearby drivers in just a few seconds.";

            features[1].querySelector("h3").textContent =
                "Real-time map";

            features[1].querySelector("p").textContent =
                "See your route live with modern GPS.";

            features[2].querySelector("h3").textContent =
                "More security";

            features[2].querySelector("p").textContent =
                "Verified drivers and 24/7 support.";

            features[3].querySelector("h3").textContent =
                "Easy payment";

            features[3].querySelector("p").textContent =
                "PIX, card or cash.";

            // TIPOS DE CORRIDA
            const rides = document.querySelectorAll(".ride-option");

            rides[0].querySelector("p").textContent =
                "Luxury and premium comfort.";

            rides[1].querySelector("p").textContent =
                "More comfortable rides.";

            rides[2].querySelector("h3").textContent =
                "WN Economy";

            rides[2].querySelector("p").textContent =
                "Fast and affordable rides.";

            // AVALIAÇÕES
            const reviews = document.querySelectorAll(".review");

            reviews[0].querySelector("p").textContent =
                "“Very beautiful and fast application. The experience feels like an international app.”";

            reviews[1].querySelector("p").textContent =
                "“Amazing map and very polite drivers.”";

            reviews[2].querySelector("p").textContent =
                "“Premium and very modern design.”";

            // DOWNLOAD
            document.querySelector(".download h2").textContent =
                "Download the WN57 app";

            document.querySelector(".download p").textContent =
                "Request your ride in seconds with a modern, fast and secure platform.";

            document.querySelector(".download .btn").textContent =
                "Download";

            // RODAPÉ
            document.querySelector("footer").textContent =
                "© 2026 WN57 • All rights reserved";
        }

        if (escolha === "2") {

            location.reload();

        }

    });

});


//aceitar cookies
const cookieBanner = document.getElementById("cookieBanner");
const aceitarCookie = document.getElementById("aceitarCookie");
const recusarCookie = document.getElementById("recusarCookie");
const fecharCookie = document.getElementById("fecharCookie");

function esconderCookies() {
    cookieBanner.classList.add("esconder");
}

aceitarCookie.addEventListener("click", esconderCookies);

recusarCookie.addEventListener("click", esconderCookies);

fecharCookie.addEventListener("click", esconderCookies);
