const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSztBiOrLFMqZs_7g2TGdM1UxlnKoTbO7WtaQdFiODdqNe9YcVWr_rZx7ojWIqTKzychK_i1DohWD1w/pub?output=csv&gid=0";
const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(sheetURL)}`;
var globalSheetData;

// --- FONCTION fetchSheetData CORRIGÉE ---
async function fetchSheetData() {
    const messageP = document.getElementById("chargement");
    try {
        messageP.hidden = false
        const response = await fetch(proxyURL,{mode: 'cors'});
        const data = await response.json();
        
        const sheetContent = data.contents;
        
        // 🚀 CORRECTION DE L'EXPRESSION RÉGULIÈRE : 
        // Recherche ce qui suit "base64," pour être plus robuste, car "charset=utf-8;" est absent.
        const base64Match = sheetContent.match(/base64,(.*)/s); 

        if (!base64Match || !base64Match[1]) {
            throw new Error("Base64 data not found in response contents.");
        }

        const base64Data = base64Match[1];
        
        // --- DÉCODAGE BASE64 EN UTF-8 ---
        // 1. Décodage Base64 en chaîne binaire brute (Latin-1)
        const binaryString = atob(base64Data);
        
        // 2. Conversion de la chaîne Latin-1 en Array d'octets (Uint8Array)
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        // 3. Décodage des octets en Texte UTF-8 (Assure la gestion des accents)
        const decodedCSV = new TextDecoder('utf-8').decode(uint8Array);
        
        globalSheetData = parseCSV(decodedCSV);
        messageP.hidden = true
    } catch (error) {
        // Gestion des erreurs DOM : Assurez-vous que l'élément 'messageP' existe.
        if (messageP) {
            messageP.innerText = `Erreur lors de la récupération des données : ${error.message || error}`
        }
        console.error("Erreur lors de la récupération des données :", error);
        globalSheetData = [];
    }
}
// ------------------------------------------

function parseCSV(csv) {
    const lines = csv.split("\n");
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim(); // Trim pour éviter les lignes vides
        if (line === "") continue; 
        
        const columns = line.split(",");
        
        // Vous utilisez les colonnes [0], [1], [3], [5]
        if (columns.length >= 6) { 
            result.push({
                year: columns[0].trim(), 
                event: columns[1].trim(), 
                // Assurez-vous que columns[3] est le lien complet pour que split('/')[5] fonctionne
                folder: columns[3].trim().split('/')[5], 
                default: columns[5].trim() 
            });
        }
    }
    return result;
}

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