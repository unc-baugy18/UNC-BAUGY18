// =========================================================
// 1. CONFIGURATION ET VARIABLES
// =========================================================

// Mappage des années vers leurs GID d'onglets respectifs
const GID_MAPPING = {
    // Année 2025: Nouveau GID
    2025: '1867282788',  
    
    // Année 2024: Ancien GID 0
    2024: '0', 
};

var globalSheetData;
const DEFAULT_YEAR = 2025;
const SHEET_BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSztBiOrLFMqZs_7g2TGdM1UxlnKoTbO7WtaQdFiODdqNe9YcVWr_rZx7ojWIqTKzychK_i1DohWD1w/pub?output=csv";
const PROXY_BASE_URL = "https://api.allorigins.win/get?url=";


// Fonction pour récupérer l'année demandée dans l'URL
function getYearFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const yearParam = urlParams.get('year');
    
    if (yearParam) {
        return isNaN(Number(yearParam)) ? null : Number(yearParam);
    }
    
    // Année par défaut
    return DEFAULT_YEAR; 
}

// =========================================================
// 2. FONCTIONS DE RÉCUPÉRATION (Chargement par GID)
// =========================================================

async function fetchSheetData() {
    const messageP = document.getElementById("chargement");
    
    // Déterminer le GID à utiliser
    const requestedYear = getYearFromURL(); 
    
    // Utilise le GID de l'année.
    const gidToUse = GID_MAPPING[requestedYear] || GID_MAPPING[2025]; 

    // Construire l'URL qui charge l'onglet spécifique (et donc moins de données)
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
    const lines = csv.split("\n");
    const result = [];
    const separator = ","; 

    // Définition des index de colonnes mis à jour (selon votre structure confirmée)
    const ANNEE_INDEX = 0;
    const DOSSIER_INDEX = 1;
    const ID_DOSSIER_INDEX = 2; // Id_Dossier
    const IMAGE_REF_INDEX = 7;  // Image de référence

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue; 
        
        const columns = line.split(separator); 
        
        // Nous vérifions que la ligne contient au moins 8 colonnes (index 0 à 7)
        if (columns.length >= IMAGE_REF_INDEX + 1) { 
            
            const folderId = columns[ID_DOSSIER_INDEX].trim();
            
            result.push({
                year: columns[ANNEE_INDEX].trim(), 
                event: columns[DOSSIER_INDEX].trim(), 
                folder: folderId, // Utilise directement l'Id_Dossier de l'index [2]
                default: columns[IMAGE_REF_INDEX].trim() // Utilise Image de référence de l'index [7]
            });
        }
    }
    return result;
}


// =========================================================
// 3. LOGIQUE D'AFFICHAGE ET DE ROUTAGE (AJUSTÉE)
// =========================================================

fetchSheetData().then(() => {
    
    // --- ROUTAGE ---
    const requestedYear = getYearFromURL();

    if (requestedYear) {
        // CAS 1: Année spécifique demandée. On affiche directement les événements de cette année.
        displayEvents(requestedYear); 

        // Le bouton retour renvoie à la liste des dates (mode Archives Complètes) ou à l'accueil
        document.getElementById('back').addEventListener('click', () => {
             // Redirection vers la page sans paramètre (qui affichera les années)
             window.location.href = 'archives-photos.html'; 
        }, { once: true });
        
    } else {
        // CAS 2: Pas d'année spécifiée. On affiche la liste des années disponibles.
        displayDates();
    }
    // ----------------------


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
        // Filtre les événements pour l'année donnée (même si le GID n'en contient qu'une)
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
        
        // Réaffectation du bouton retour (nécessaire si l'on revient de displayFolder)
        document.getElementById('back').addEventListener('click', () => {
            if (requestedYear) {
                 window.location.href = 'archives-photos.html'; // Retour au menu principal si année fixe
            } else {
                 displayDates(); // Retour à la liste des années si Archives Complètes
            }
        }, { once: true });


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

   // --- FONCTION displayFolder (Redirection vers le dossier Drive) ---
    function displayFolder(date, event) {
        // 1. Trouver l'entrée de dossier unique dans les données chargées
        const item = globalSheetData.find(row => 
            Number(row.year) === date && 
            row.event === event && 
            row.folder // S'assure que l'ID du dossier existe
        );

        if (!item || !item.folder) {
            alert("ID de dossier Google Drive introuvable pour cet événement.");
            return;
        }

        const folderId = item.folder; 
        
        // 2. Construire l'URL du dossier Google Drive
        const driveUrl = `https://drive.google.com/drive/folders/${folderId}`;

        // 3. Redirection : Ouvrir le dossier Drive dans un nouvel onglet
        window.open(driveUrl, '_blank');
        
        // 4. Afficher un message de confirmation sur la page actuelle
        
        document.getElementsByClassName('bouton-retour')[0].hidden = true; 
        document.getElementById('events-list').innerHTML = ''; 
        document.getElementById('folder-list').innerHTML = '';

        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `
            <h1 style="text-align:center;">Ouverture du dossier photo "${event}" sur Google Drive...</h1>
            <p style="text-align:center;">Si la fenêtre ne s'ouvre pas, veuillez vérifier vos bloqueurs de pop-up.</p>
        `;
        document.getElementById('folder-list').appendChild(messageDiv);
    }
    // -----------------------------------------------------------------
}) // <-- Fin de la promesse fetchSheetData().then()