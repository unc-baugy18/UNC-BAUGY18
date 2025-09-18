// Fonction pour vérifier si une image existe
async function imageExiste(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (e) {
        return false;
    }
}

// Fonction pour afficher le personnel
async function afficherPersonnel() {
    try {
        const reponse = await fetch('contact.json');
        const { bureau, membres } = await reponse.json();
        const bureau_group = document.getElementById('bureau');
        const bureau_indiv = document.getElementById('bureau-indiv');
        const membres_indiv = document.getElementById('membres');
        const cheminImages = "UNC de Baugy_fichiers/photos/";
        const avatarParDefaut = `${cheminImages}default-avatar.png`;

        // Afficher le bureau
        for (const element of bureau) {
            if (element.type === "groupe") {
                const groupeDiv = document.createElement('div');
                groupeDiv.className = "groupe";

                for (const membre of element.membres) {
                    let imagePath = membre.image ?
                        `${cheminImages}${membre.image}` :
                        avatarParDefaut;

                    const existe = await imageExiste(imagePath);
                    if (!existe && membre.image) {
                        imagePath = avatarParDefaut;
                    }

                    // Nouveau code qui gère l'affichage de l'email
                    const membreCarte = document.createElement('div');
                    membreCarte.className = 'card-role';

                    let emailLink = '';
                    // Si le groupe a un attribut 'mail', on crée le lien
                    if (element.mail) {
                        emailLink = `<a href="mailto:${element.mail}" class="card-mail">${element.mail}</a>`;
                    }

                    // On reconstruit le contenu HTML pour inclure le lien
                    membreCarte.innerHTML = `
                        <img src="${imagePath}" alt="${membre.nom}" class="card-image"/>
                        <div class="card-info">
                            <p class="card-text" id="role">${membre.role}</p>
                            <p class="card-text" id="nom">${membre.nom}</p>
                            ${emailLink}
                        </div>
                    `;
                    groupeDiv.appendChild(membreCarte);
                }

                bureau_group.appendChild(groupeDiv);
            } else if (element.type === "individuel") {
                const membre = element.membre;
                let imagePath = membre.image ?
                    `${cheminImages}${membre.image}` :
                    avatarParDefaut;

                const existe = await imageExiste(imagePath);
                if (!existe && membre.image) {
                    imagePath = avatarParDefaut;
                }

                const individuelDiv = document.createElement('div');
                individuelDiv.className = 'card-role';
                individuelDiv.innerHTML = `
                    <img src="${imagePath}" alt="${membre.nom}" class="card-image"/>
                    <div class="card-info">
                        <p class="card-text" id="role">${membre.role}</p>
                        <p class="card-text" id="nom">${membre.nom}</p>
                    </div>
                `;
                bureau_indiv.appendChild(individuelDiv);
            }
        }

        // Afficher les membres
        for (const membre of membres) {
            let imagePath = membre.image ?
                `${cheminImages}${membre.image}` :
                avatarParDefaut;

            const existe = await imageExiste(imagePath);
            if (!existe && membre.image) {
                imagePath = avatarParDefaut;
            }

            const membreDiv = document.createElement('div');
            membreDiv.className = 'card-membre';
            membreDiv.innerHTML = `
                <img src="${imagePath}" alt="${membre.nom}" class="card-image"/>
                <div class="card-info">
                    <p class="card-text" id="nom">${membre.nom}</p>
                </div>
            `;
            membres_indiv.appendChild(membreDiv);
        }
    } catch (erreur) {
        console.error("Erreur :", erreur);
    }
}

// Appel de la fonction au chargement de la page
window.onload = afficherPersonnel;
