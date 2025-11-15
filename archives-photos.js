// URL de publication directe en JSON, généralement compatible CORS
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSztBiOrLFMqZs_7g2TGdM1UxlnKoTbO7WtaQdFiODdqNe9YcVWr_rZx7ojWIqTKzychK_i1DohWD1w/pub?output=json";
var globalSheetData; // Conserver la variable globale


// --- NOUVELLE FONCTION fetchSheetData POUR JSON DIRECT ---
async function fetchSheetData() {
    const messageP = document.getElementById("chargement");
    try {
        messageP.hidden = false;
        
        // 🚨 Changement ici : on utilise l'URL directe, et on attend du JSON
        const response = await fetch(sheetURL); 
        const data = await response.json(); 
        
        // Le JSON de Google est structuré. Les données de la feuille sont dans 'feed.entry'
        const rawEntries = data.feed.entry;
        
        // Nous allons maintenant formater ces entrées.
        globalSheetData = parseJSONEntries(rawEntries); 

        messageP.hidden = true;
    } catch (error) {
        if (messageP) {
            // Afficher l'erreur si la récupération échoue
            messageP.innerText = `Erreur lors de la récupération des données : ${error.message || error}. Veuillez vérifier le lien de votre feuille.`
        }
        console.error("Erreur lors de la récupération des données :", error);
        globalSheetData = [];
    }
}
// -------------------------------------------------------------

// --- FONCTION parseJSONEntries DÉFINITIVE ---
function parseJSONEntries(entries) {
    const result = [];
    
    // Noms de colonnes de votre Google Sheet : Année, Dossier, Source_Drive, image de référence (colonne F)
    for (const entry of entries) {
        
        // Clés Google Sheet attendues (tout en minuscules, sans espaces/accents)
        // Note : J'utilise 'gsx$source_drive' car votre en-tête a un underscore.
        // J'utilise 'gsx$imagedereference' pour la colonne F (image de référence).
        const sourceDriveKey = entry.gsx$source_drive; 
        const eventKey = entry.gsx$dossier;           
        const yearKey = entry.gsx$annee;              
        const defaultKey = entry.gsx$imagedereference; 
        
        // 1. Extraction des valeurs
        const sourceDrive = sourceDriveKey ? sourceDriveKey.$t.trim() : "";
        const eventName = eventKey ? eventKey.$t.trim() : "";
        const yearValue = yearKey ? yearKey.$t.trim() : "";
        const defaultValue = defaultKey ? defaultKey.$t.trim().toLowerCase() : "";

        // 2. Extraction de l'ID du Drive
        let folderId = "";
        try {
            if (sourceDrive) {
                // Recherche l'ID entre /d/ et /view.
                const match = sourceDrive.match(/\/d\/([a-zA-Z0-9_-]+)/);
                folderId = match ? match[1] : "";
            }
        } catch (e) {
             console.warn("Erreur de parsing du lien Drive pour une entrée.", sourceDrive);
        }

        // 3. Pousser les données formatées
        if (yearValue && eventName && sourceDrive) {
            result.push({
                year: yearValue,
                event: eventName,
                folder: folderId, // Contient l'ID du fichier
                default: defaultValue // Contient 'x' si c'est la photo par défaut de l'événement
            });
        }
    }
    return result;
}
// ------------------------------------------

fetchSheetData().then(() => {
    // ... Le reste de votre logique d'affichage (displayDates, displayEvents, displayFolder)
    // est inchangé car elle fonctionne sur le `globalSheetData` correctement peuplé.

    function displayDates() {
        const dates = [...new Set(globalSheetData.map(item => Number(item.year)))];
        document.getElementsByClassName('bouton-retour')[0].hidden = true;

        document.getElementById('dates-list').innerHTML = '';
        document.getElementById('events-list').innerHTML = '';
        document.getElementById('folder-list').innerHTML = '';

        for (const date of dates) {
            const dateDiv = document.createElement('a');
            dateDiv.href = "";
            dateDiv.classList.add('card-photo','photo');
            dateDiv.innerHTML = `
            <img class="card-date" src="https://placehold.co/90x90/aabbcc/ffffff?text=${date}" alt="">
            <h3 class="card-title">${date}</h3>
            `;
            dateDiv.addEventListener('click', (event) => {
                event.preventDefault();
                displayEvents(date);
            })
            document.getElementById('dates-list').appendChild(dateDiv);
        }
    }

    function displayEvents(date) {

        const events = {};

        for (const row of globalSheetData) {
            if (Number(row.year) === date) {
                if (!(row.event in events)){
                    events[row.event] = "";
                }
                if (row.default.toLowerCase() === "x") {
                    events[row.event] = row.folder;
                }
            }
        }

        document.getElementsByClassName('bouton-retour')[0].hidden = false;
        document.getElementById('back').addEventListener('click', () => {
            displayDates();
        })

        document.getElementById('dates-list').innerHTML = '';
        document.getElementById('events-list').innerHTML = '';
        document.getElementById('folder-list').innerHTML = '';

        
        for (const [evennement, imageLink] of Object.entries(events)) {
            const eventDiv = document.createElement('a');
            eventDiv.href = "";
            eventDiv.classList.add('card-photo','photo');
            if (imageLink === "") {
                eventDiv.innerHTML = `
                <div class="photo-event">
                    <img class="placeholder" src="https://placehold.co/90x90/aabbcc/ffffff?text=${evennement}" alt="">
                </div>
                <h3 class="card-title">${decodeURIComponent(evennement)}</h3>`
            } else {
                eventDiv.innerHTML = `
                <div class="photo-event">
                    <img class="image-adaptee" src="https://drive.google.com/thumbnail?id=${imageLink}" alt="⚠️ Image introuvable" Access-Control-Allow-Origin></img>
                </div>
                <h3 class="card-title">${decodeURIComponent(evennement)}</h3>`
            }
            eventDiv.addEventListener('click', (event) => {
                event.preventDefault();
                displayFolder(date, evennement);
            })
            document.getElementById('events-list').appendChild(eventDiv);
        }

        document.querySelectorAll('.image-adaptee').forEach(img => {
            img.onload = function() {
                if (this.naturalWidth > this.naturalHeight) {
                // Image en paysage : priorité à la hauteur
                this.style.height = '100%';
                this.style.width = 'auto';
                this.style.maxWidth = 'none';
                } else {
                // Image en portrait : priorité à la largeur
                this.style.width = '100%';
                this.style.height = 'auto';
                this.style.maxHeight = 'none';
                }
            };
        });
    }

    function displayFolder(date, event) {
        const folder = [...new Set(globalSheetData
            .filter(item => Number(item.year) === date && item.event === event)
            .map(item => item.folder))];
        document.getElementsByClassName('bouton-retour')[0].hidden = false;
        document.getElementById('back').addEventListener('click', () => {
            displayEvents(date);
        })
        
        document.getElementById('dates-list').innerHTML = '';
        document.getElementById('events-list').innerHTML = '';
        document.getElementById('folder-list').innerHTML = '';

        for (var folderName of folder) {
            const folderDiv = document.createElement('a');
            folderDiv.href = `https://drive.google.com/file/d/${folderName}/view?usp=drive_link`;
            folderDiv.target = "_blank"
            folderDiv.classList.add('card-photo','photo');
            folderDiv.innerHTML = `
            <img src="https://drive.google.com/thumbnail?id=${folderName}" alt="⚠️ Image introuvable" Access-Control-Allow-Origin></img>
            `;
            document.getElementById('folder-list').appendChild(folderDiv);
        }
    }

    displayDates();
})