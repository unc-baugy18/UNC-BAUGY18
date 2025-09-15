const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSztBiOrLFMqZs_7g2TGdM1UxlnKoTbO7WtaQdFiODdqNe9YcVWr_rZx7ojWIqTKzychK_i1DohWD1w/pub?output=csv&gid=0";
const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(sheetURL)}`;
var globalSheetData;
// Dans loadSheetData, après avoir rempli globalSheetData :

async function fetchSheetData() {
    try {
        const response = await fetch(proxyURL,{mode: 'cors'});
        const data = await response.json();
        const sheetContent = data.contents;
        const base64Match = sheetContent.match(/data:text\/csv; charset=utf-8;base64,([^"]+)/);
        const base64Data = atob(base64Match[1]);
        const uint8Array = new Uint8Array(base64Data.length);
        for (let i = 0; i < base64Data.length; i++) {
            uint8Array[i] = base64Data.charCodeAt(i);
        }
        const decodedCSV = new TextDecoder('utf-8').decode(uint8Array);
        globalSheetData = parseCSV(decodedCSV);
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        globalSheetData = [];
    }
}

function parseCSV(csv) {
  const lines = csv.split("\n");
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].split(",");
    if (line.length >= 2) {
      result.push({
        year: line[0].trim(),  // Première colonne = année
        event: line[1].trim(),  // Deuxième colonne = événement
        folder: line[3].trim().split('/')[5],  // Quatrième colonne = dossier
        default: line[5].trim()  // Sixième colonne = image par défaut
      });
    }
  }
  return result;
}


fetchSheetData().then(() => {

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
