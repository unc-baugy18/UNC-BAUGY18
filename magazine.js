const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSztBiOrLFMqZs_7g2TGdM1UxlnKoTbO7WtaQdFiODdqNe9YcVWr_rZx7ojWIqTKzychK_i1DohWD1w/pub?output=csv&gid=284553090";
const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(sheetURL)}`;
var globalSheetData;

// --- FONCTION fetchSheetData MISE À JOUR POUR UTF-8 ---
async function fetchSheetData() {
    try {
        const response = await fetch(proxyURL, { mode: 'cors' });
        const data = await response.json();
        
        const sheetContent = data.contents;
        
        // 🚀 CORRECTION DE L'EXPRESSION RÉGULIÈRE :
        // Capture la chaîne Base64 juste après "base64," (on ignore le "charset=utf-8;" manquant).
        const base64Match = sheetContent.match(/base64,(.*)/s); 

        if (!base64Match || !base64Match[1]) {
            throw new Error("Base64 data not found in response contents.");
        }
        
        const base64Data = base64Match[1];
        
        // --- GESTION UTF-8 ---
        // 1. Décodage Base64 en chaîne de caractères Latin-1 (comme si c'était des octets)
        const binaryString = atob(base64Data);
        
        // 2. Conversion de la chaîne Latin-1 en Array d'octets (Uint8Array)
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        // 3. Décodage des octets en Texte UTF-8
        // C'est l'étape cruciale qui assure la bonne interprétation des accents.
        const decodedCSV = new TextDecoder('utf-8').decode(uint8Array);
        
        globalSheetData = parseCSV(decodedCSV);
        
    } catch (error) {
        console.error("Erreur lors de la récupération ou du décodage des données :", error);
        globalSheetData = [];
    }
}

function parseCSV(csv) {
    const lines = csv.split("\n");
    const result = [];
    // On commence à 1 pour sauter l'en-tête
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue; 
        
        // Utiliser une regex pour le split par virgule, mais qui ignore les virgules 
        // à l'intérieur de guillemets doubles (souvent inutiles pour les CSV de Google Sheets)
        // Mais pour la simplicité, restons avec split(',')
        const columns = line.split(","); 
        
        if (columns.length >= 5) { 
            const numberColumn = columns[2].trim();
            // Extraction robuste du numéro (séquence de chiffres à la fin)
            const numberMatch = numberColumn.match(/(\d+)$/); 
            const number = numberMatch ? numberMatch[1] : '';

            result.push({
                date: columns[0].trim(), 
                year: columns[1].trim(), 
                number: number,
                link: columns[3].trim(), 
                image: columns[4].trim() 
            });
        }
    }
    return result;
}

fetchSheetData().then(() => {
    // ... Tri et filtrage ...
    globalSheetData.sort((a, b) => {
        return parseInt(a.number) - parseInt(b.number);
    }).reverse();
    globalSheetData = globalSheetData.filter(item => item.link !== "" && item.image !== "");
    
    // ... Affichage des éléments ...
    const carrousselElementsDiv = document.querySelector(".carroussel-elements");
    if (carrousselElementsDiv) {
         carrousselElementsDiv.innerHTML = "";
    }
    
    globalSheetData.forEach(item => {
        if (carrousselElementsDiv) {
            const carrousselCardDiv = document.createElement("a");
            carrousselCardDiv.href = item.link;
            carrousselCardDiv.classList.add("card-magazine");
            carrousselCardDiv.innerHTML = `<div class="card-magazine-image">
                                                <img src="${item.image}" alt="${item.number}" onerror="this.onerror=null;this.src='https://placehold.co/165x230/aabbcc/ffffff?text=n°${item.number}';">
                                            </div>
                                            <p>${item.date} ${item.year}</p>`;  
            carrousselElementsDiv.appendChild(carrousselCardDiv);
        }
    });
});