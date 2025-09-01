const sheetURL = "..."
const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(sheetURL)}`;
var globalSheetData;
// Dans loadSheetData, après avoir rempli globalSheetData :

async function fetchSheetData() {
  try {
    const response = await fetch(proxyURL);
    const data = await response.json();
    console.log(data);
    const sheetContent = data.contents;
    const base64Match = sheetContent.match(/data:text\/csv;base64,([^"]+)/);
    let decodedCSV = base64Match && base64Match[1] ? atob(base64Match[1]) : sheetContent;
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
        folder: line[3].trim(),  // Quatrième colonne = dossier
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
            dateDiv.classList.add('card-role','photo');
            dateDiv.innerHTML = `
            <img class="card-image" src="https://placehold.co/90x90/aabbcc/ffffff?text=${date}" alt="">
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
        // const events = [...new Set(globalSheetData
        //     .filter(item => Number(item.year) === date)
        //     .map(item => item.event))];

        const eventsWithDefaultImages = {};

        for (const row of globalSheetData) {
            if (row[5] === "x") {
                eventsWithDefaultImages[row[0]] = row[3];
            }
        }

        console.log(eventsWithDefaultImages);

        document.getElementsByClassName('bouton-retour')[0].hidden = false;
        document.getElementById('back').addEventListener('click', () => {
            displayDates();
        })

        document.getElementById('dates-list').innerHTML = '';
        document.getElementById('events-list').innerHTML = '';
        document.getElementById('folder-list').innerHTML = '';
        
        for (const evennement of events) {
            const eventDiv = document.createElement('a');
            eventDiv.href = "";
            eventDiv.classList.add('card-role','photo');
            eventDiv.innerHTML = `
            <img class="card-image" src="https://placehold.co/90x90/aabbcc/ffffff?text=${evennement}" alt="">
            <h3 class="card-title">${evennement}</h3>
            `;
            eventDiv.addEventListener('click', (event) => {
                event.preventDefault();
                displayFolder(date, evennement);
            })
            document.getElementById('events-list').appendChild(eventDiv);
        }
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
            folderName = folderName.replace('/view?usp=drive_link', '/preview')
            const folderDiv = document.createElement('a');
            folderDiv.href = folderName;
            folderDiv.target = "_blank"
            folderDiv.classList.add('card-role','photo');
            folderDiv.innerHTML = `
            <iframe src="${folderName}" frameborder='0' height="200" allow="autoplay"></iframe>
            `;
            document.getElementById('folder-list').appendChild(folderDiv);
        }
    }

    displayDates();
})
