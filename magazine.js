const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSztBiOrLFMqZs_7g2TGdM1UxlnKoTbO7WtaQdFiODdqNe9YcVWr_rZx7ojWIqTKzychK_i1DohWD1w/pub?output=csv&gid=284553090";
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
        date: line[0].trim(),  // Première colonne = date
        year: line[1].trim(),  // Deuxième colonne = annee
        number: line[2].trim().split(" ")[1],  // Troisième colonne = numéro
        link: line[3].trim(),  // Quatrième colonne = lien
        image: line[4].trim() // Cinquième colonne = image
      });
    }
  }
  return result;
}


fetchSheetData().then(() => {
    globalSheetData.sort((a, b) => {
        return parseInt(a.number) - parseInt(b.number);
    });
    globalSheetData = globalSheetData.filter(item => item.link !== "" && item.image !== "");
    
    const carrousselElementsDiv = document.querySelector(".carroussel-elements");
    
    globalSheetData.forEach(item => {
        const carrousselCardDiv = document.createElement("a");
        carrousselCardDiv.href = item.link;
        carrousselCardDiv.classList.add("card-magazine");
        carrousselCardDiv.innerHTML = `<div class="card-magazine-image">
                                            <img src="${item.image}" alt="${item.number}" onerror="this.onerror=null;this.src='https://placehold.co/165x230/aabbcc/ffffff?text=n°${item.number}';">
                                       </div>
                                       <p>${item.date} ${item.year}</p>`;  
        carrousselElementsDiv.appendChild(carrousselCardDiv);
    });
});
