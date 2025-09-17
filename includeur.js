// Script pour inclure le header
fetch("./header.html")
    .then(response => response.text())
    .then(data => {
        document.querySelector("header").innerHTML = data;
        const currentPage = document.body.getAttribute('data-page');
        const navLinks = document.querySelectorAll('header a[data-target]');
        navLinks.forEach(link => {
            if (link.getAttribute('data-target') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    });

// Script pour inclure le footer ET ajouter le compteur
fetch("./footer.html")
    .then(response => response.text())
    .then(data => {
        // 1. Insérer le contenu du footer.html dans la balise <footer>
        document.querySelector("footer").innerHTML = data;

        // 2. Appel de la fonction pour afficher le compteur
        afficherCompteurVisites();
    });

// La fonction principale qui gère le compteur
function gererCompteurVisites() {
    const urlJson = "https://hitscounter.dev/api/hit?output=json&url=https%3A%2F%2Func-baugy18.fr%2F";
    const compteurElement = document.getElementById("compteur-valeur");

    // Clé pour le stockage local
    const visiteDejaComptee = localStorage.getItem('visiteComptee');
    const maintenant = new Date().getTime();

    // Vérifie si un "drapeau" de visite a déjà été stocké et s'il est encore valide (par exemple, 24h)
    // Ici, le drapeau sera valide pour une session de 15 minutes pour l'exemple.
    if (visiteDejaComptee && (maintenant - visiteDejaComptee) < 900000) { // 900000 ms = 15 minutes
        // Si la visite a déjà été comptée, on ne fait rien
        fetch(urlJson)
            .then(response => response.json())
            .then(data => {
                compteurElement.textContent = data.count;
            })
            .catch(error => {
                console.error('Erreur de récupération du compteur JSON :', error);
            });
    } else {
        // C'est une nouvelle session, on incrémente le compteur
        fetch(urlJson)
            .then(response => response.json())
            .then(data => {
                compteurElement.textContent = data.count;
                // Stocker la visite pour éviter de re-compter
                localStorage.setItem('visiteComptee', maintenant);
            })
            .catch(error => {
                console.error('Erreur de récupération du compteur JSON :', error);
            });
    }
}

// Adaptez le reste de votre includeur.js pour appeler cette fonction après le chargement du footer
fetch("./footer.html")
    .then(response => response.text())
    .then(data => {
        document.querySelector("footer").innerHTML = data;
        gererCompteurVisites();
    });

// Le reste de votre code de includeur.js pour le header
fetch("./header.html")
    .then(response => response.text())
    .then(data => {
        document.querySelector("header").innerHTML = data;
        const currentPage = document.body.getAttribute('data-page');
        const navLinks = document.querySelectorAll('header a[data-target]');
        navLinks.forEach(link => {
            if (link.getAttribute('data-target') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    });