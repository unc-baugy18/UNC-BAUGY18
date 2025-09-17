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

// Fonction pour afficher le compteur de visites
function afficherCompteurVisites() {
    const urlCompteur = "https://hitscounter.dev/api/hit?url=https%3A%2F%2Func-baugy18.fr%2F&label=Nombre+de+visiteur&icon=people-fill&color=%23198754&message=&style=plastic&tz=Europe%2FParis";
    
    // Récupérer l'élément HTML où le compteur doit être affiché
    // Note : On le cherche DANS le pied de page qui vient d'être chargé
    const conteneurCompteur = document.getElementById("compteur-valeur");

    // S'assurer que le conteneur existe avant de continuer
    if (conteneurCompteur) {
        // Créer une nouvelle balise d'image
        const imageCompteur = document.createElement("img");
        imageCompteur.src = urlCompteur;
        imageCompteur.alt = "Compteur de visites";

        // Vider le contenu "Chargement..." et insérer l'image
        conteneurCompteur.innerHTML = "";
        conteneurCompteur.appendChild(imageCompteur);
    }
}