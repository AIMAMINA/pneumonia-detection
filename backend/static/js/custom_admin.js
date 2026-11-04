document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;

    // 🎯 Login / Logout page : ajout du style personnalisé
    if (["/admin/login/", "/admin/logout/"].includes(path)) {
        document.body.classList.add("elhakim-login");
        return;
    }

    // ⏳ Attendre que la navbar soit présente
    setTimeout(() => {
        const navbar = document.getElementById("jazzy-navbar");
        const csrfToken =
            document.querySelector('input[name="csrfmiddlewaretoken"]')?.value ||
            document.querySelector('meta[name="csrf-token"]')?.content;

        const oldDropdown = document.getElementById("jazzy-usermenu");
        if (!navbar || !csrfToken) return;
        if (oldDropdown) oldDropdown.remove();

        const btnWrapper = document.createElement("div");
        btnWrapper.className = "navbar-buttons";

        // 🔐 Bouton "Change Password"
        const pwdBtn = document.createElement("a");
        pwdBtn.href = "/admin/password_change/";
        pwdBtn.className = "nav-action-btn";
        pwdBtn.innerText = "Change Password";
        btnWrapper.appendChild(pwdBtn);

        // 🚪 Formulaire "Logout"
        const logoutForm = document.createElement("form");
        logoutForm.method = "POST";
        logoutForm.action = "/admin/logout/";
        logoutForm.innerHTML = `
            <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
            <button type="submit" class="nav-action-btn">Logout</button>
        `;
        btnWrapper.appendChild(logoutForm);

        navbar.appendChild(btnWrapper);
    }, 300);

    // 🧠 Dashboard Customization
    if (path === "/admin/") {
        const content = document.querySelector(".col-lg-9.col-12") || document.querySelector(".content");
        if (!content) return;

        // ❌ Supprimer les modules "API" et "Authentication"
        document.querySelectorAll(".dashboard-module").forEach(module => {
            const title = module.querySelector("h2")?.innerText?.toLowerCase();
            if (title?.includes("api") || title?.includes("authentication")) {
                module.remove();
            }
        });

        const parentContainer = document.querySelector(".dashboard-module")?.parentElement || content;

        // 💳 Cartes de statistiques
        const cardContainer = document.createElement("div");
        cardContainer.className = "elhakim-dashboard-cards";

        const createCard = (title, value) => `
            <div class="card">
                <h2>${value}</h2>
                <p>${title}</p>
            </div>
        `;

        fetch("/api/dashboard-stats/")
            .then(res => res.json())
            .then(data => {
                cardContainer.innerHTML = `
                    ${createCard("Appointments", data.appointments.total)}
                    ${createCard("Scans", data.scans.total)}
                    ${createCard("Users", data.users.total)}
                `;
                parentContainer.prepend(cardContainer);
            })
            .catch(err => console.error("Dashboard stats error:", err));
    }

    // 📦 Ajout d’un espacement pour la section supérieure
    const topBlock = document.querySelector(".content.border-bottom.mb-2");
    if (topBlock) {
        topBlock.classList.add("elhakim-dashboard-spacing");
    }
});


