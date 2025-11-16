// =========================================================
// 1. CONFIGURATION ET VARIABLES (Mettez à jour vos GID ici)
// =========================================================

// Mappage des années vers leurs GID d'onglets allégés
const GID_MAPPING = {
    // 2025 : GID de l'onglet consolidé avec 1 ligne par dossier (moins de 615 lignes)
    2025: '1867282788', // <--- REMPLACEZ PAR VOTRE GID RÉEL DE L'ONGLET 2025 CONSOLIDÉ
    
    // 2024 : GID de l'onglet 2024
    2024: '0', 
};

var globalSheetData;
const DEFAULT_YEAR = 2025; 
const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSztBiOrLFMqZs_7g2TGdM1UxlnKoTb07WtaQdFiODdqNe9YcVWr_rZx7ojWIqTKzychK_i1DohWD1w/pub?output=csv";
const PROXY_BASE_URL = "https://api.allorigins.win/get?url=";


// Fonction pour récupérer l'année demandée (retourne 2025 par défaut)
function getYearFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const yearParam = urlParams.get('year');
    
    if (yearParam && !isNaN(Number(yearParam))) {
        return Number(yearParam);
    }
    
    // Année par défaut
    return DEFAULT_YEAR; 
}

// =========================================================
// 2. FONCTIONS DE RÉCUPÉRATION (Maintient la logique GID / Proxy)
// =========================================================

async function fetchSheetData() {
    const messageP = document.getElementById("chargement");
    
    const requestedYear = getYearFromURL(); 
    const gidToUse = GID_MAPPING[requestedYear] || GID_MAPPING[DEFAULT_YEAR]; 

    const sheetURL = `${SHEET_BASE_URL}&gid=${gidToUse}`;
    const proxyURL = `${PROXY_BASE_URL}${encodeURIComponent(sheetURL)}`;

    try {
        messageP.hidden = false
        const response = await fetch(proxyURL,{mode: 'cors'});
        const data = await response.json();
        
        const sheetContent = data.contents;
        const base64Match = sheetContent.match(/base64,(.*)/s); 

        if (!base64Match || !base64Match[1]) {
            throw new Error("Base64 data not found in response contents.");
        }

        const base64Data = base64Match[1];
        const binaryString = atob(base64Data);
        
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        const decodedCSV = new TextDecoder('utf-8').decode(uint8Array);
        
        globalSheetData = parseCSV(decodedCSV);
        messageP.hidden = true
    } catch (error) {
        if (messageP) {
            messageP.innerText = `Erreur lors de la récupération des données : ${error.message || error}`
        }
        console.error("Erreur lors de la récupération des données :", error);
        globalSheetData = [];
    }
}

function parseCSV(csv) {
    // La fonction reste la même car elle lit déjà les colonnes nécessaires
    const lines = csv.split("\n");
    const result = [];
    const separator = ","; 

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue; 
        
        const columns = line.split(separator); 
        
        // Colonnes : [0]Annee, [1]Dossier, [3]Source_Drive, [5]Image de référence
        if (columns.length >= 6) { 
            
            const sourceDriveURL = columns[3].trim();
            let folderId = "";

            const match = sourceDriveURL.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                folderId = match[1];
            } else {
                console.warn(`Impossible d'extraire l'ID Drive pour l'entrée: ${sourceDriveURL}`);
            }

            result.push({
                year: columns[0].trim(), 
                event: columns[1].trim(), 
                folder: folderId, 
                default: columns[5].trim() 
            });
        }
    }
    return result;
}

// =========================================================
// 3. LOGIQUE D'AFFICHAGE (Simplifiée)
// =========================================================

fetchSheetData().then(() => {
    
    // Le routage est maintenant simple : on va directement à l'affichage des événements
    // de l'année demandée (qui sont les seuls éléments du fichier CSV chargé).
    const requestedYear = getYearFromURL(); 
    displayEvents(requestedYear); 
    
    // La fonction displayDates est maintenant inutile car on n'affiche plus la liste des années.
    function displayDates() {
        // Laisser vide ou supprimer
        document.getElementById('dates-list').innerHTML = '';
        document.getElementsByClassName('bouton-retour')[0].hidden = true;
    }
    
    function displayEvents(date) {
        // Simplement afficher TOUTES les lignes chargées (qui sont les dossiers)
        // Comme le fichier CSV chargé ne contient que l'année demandée, pas besoin de filtrer par 'date'
        const events = {};

        for (const row of globalSheetData) {
            // Dans ce mode simplifié, chaque ligne est un événement. 
            // On utilise la ligne entière comme source de données.
            events[row.event] = row.folder; 
        }

        document.getElementsByClassName('bouton-retour')[0].hidden = false;
        
        // Le bouton retour renvoie à la page des années disponibles (HTML)
        document.getElementById('back').addEventListener('click', () => {
             window.location.href = 'archives-photos.html'; 
        }, { once: true });


        document.getElementById('dates-list').innerHTML = '';
        document.getElementById('events-list').innerHTML = '';
        document.getElementById('folder-list').innerHTML = '';

        
        for (const [evennement, imageLink] of Object.entries(events)) {
            const eventDiv = document.createElement('a');
            eventDiv.href = "";
            eventDiv.classList.add('card-photo','photo');
            
            // Afficher l'image de référence du dossier
            eventDiv.innerHTML = `
            <div class="photo-event">
                <img class="image-adaptee" src="https://drive.google.com/thumbnail?id=${imageLink}" alt="⚠️ Image introuvable" Access-Control-Allow-Origin></img>
            </div>
            <h3 class="card-title">${decodeURIComponent(evennement)}</h3>`;
            
            eventDiv.addEventListener('click', (event) => {
                event.preventDefault();
                // Utiliser displayFolder comme avant pour ouvrir le lien Drive
                displayFolder(date, evennement);
            })
            document.getElementById('events-list').appendChild(eventDiv);
        }

        // ... (Logique de redimensionnement des images inchangée) ...
         document.querySelectorAll('.image-adaptee').forEach(img => {
            img.onload = function() {
                if (this.naturalWidth > this.naturalHeight) {
                this.style.height = '100%';
                this.style.width = 'auto';
                this.style.maxWidth = 'none';
                } else {
                this.style.width = '100%';
                this.style.height = 'auto';
                this.style.maxHeight = 'none';
                }
            };
        });
    }
    
    // displayFolder reste inchangée, elle utilise le 'folder' (ID Drive)
    function displayFolder(date, event) {
        // Puisque nous sommes déjà dans l'affichage des événements, on doit trouver le 'folder'
        // directement dans les données chargées (globalSheetData).
        const item = globalSheetData.find(row => row.event === event);
        if (!item) return;

        const folderName = item.folder; 
        
        document.getElementsByClassName('bouton-retour')[0].hidden = false;
        document.getElementById('back').addEventListener('click', () => {
            // Retour à la liste des événements de l'année
            displayEvents(date); 
        }, { once: true })
        
        document.getElementById('dates-list').innerHTML = '';
        document.getElementById('events-list').innerHTML = '';
        document.getElementById('folder-list').innerHTML = '';

        // Ici, on affiche directement le lien vers le dossier Drive
        const folderDiv = document.createElement('a');
        folderDiv.href = `https://drive.google.com/file/d/${folderName}/view?usp=drive_link`;
        folderDiv.target = "_blank"
        folderDiv.classList.add('card-photo','photo');
        folderDiv.innerHTML = `
        <h1>Cliquez pour ouvrir le dossier ${decodeURIComponent(event)} sur Google Drive</h1>
        <img src="https://drive.google.com/thumbnail?id=${folderName}" alt="Dossier Drive" Access-Control-Allow-Origin></img>
        `;
        document.getElementById('folder-list').appendChild(folderDiv);
    }
})