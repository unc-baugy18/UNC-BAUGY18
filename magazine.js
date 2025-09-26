const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSztBiOrLFMqZs_7g2TGdM1UxlnKoTbO7WtaQdFiODdqNe9YcVWr_rZx7ojWIqTKzychK_i1DohWD1w/pub?output=csv&gid=284553090";
// Le proxy est conservé pour éviter les problèmes de CORS avec Google
const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(sheetURL)}`;
var globalSheetData;

// --- FONCTION PRINCIPALE MISE À JOUR ---
async function fetchSheetData() {
    try {
        const response = await fetch(proxyURL, { mode: 'cors' });
        const data = await response.json();
        
        // 🚀 CORRECTION : On utilise directement le contenu de la propriété 'contents'
        const decodedCSV = data.contents; 
        
        // La première ligne du contenu est le préfixe "data:text/csv;base64," qu'il faut retirer
        // Cependant, l'API allorigins.win renvoie juste le texte CSV dans 'contents'.
        // Si vous recevez le Base64, la ligne ci-dessous le gère. 
        
        // ❌ ATTENTION : Basé sur le contenu que vous avez montré, 'contents' contient
        // "data:text/csv;base64,..." et le Base64 est encodé dans une seule ligne.
        // MAJ : Non, votre réponse JSON indique que "contents" contient une chaîne 
        // qui COMMENCE par "data:text/csv;base64,..." suivi des données Base64.
        
        // Si la réponse est exactement celle que vous avez montrée, le contenu est
        // le CSV encodé en Base64. L'expression régulière est presque juste, 
        // il faut retirer le "charset=utf-8;" manquant.
        
        // Nouvelle expression régulière simplifiée
        const base64Match = decodedCSV.match(/base64,(.*)/s); // Capture tout après "base64," (le 's' est optionnel mais assure la capture sur plusieurs lignes si Base64 était structuré).

        if (!base64Match || !base64Match[1]) {
            throw new Error("Base64 data not found in response contents.");
        }
        
        const base64Data = base64Match[1];
        
        // Décodage standard Base64 en JavaScript
        const decodedCSVContent = atob(base64Data);

        // Vous n'avez plus besoin du Uint8Array pour le décodage simple en utf-8 (atob le gère)
        globalSheetData = parseCSV(decodedCSVContent);
        
    } catch (error) {
        console.error("Erreur lors de la récupération ou du décodage des données :", error);
        globalSheetData = [];
    }
}
// ---------------------------------------------


function parseCSV(csv) {
    const lines = csv.split("\n");
    const result = [];
    // 💡 REMARQUE IMPORTANTE : L'en-tête du CSV décodé est "Mois / Période,Année,Numéro (si dispo),Lien Calaméo,Lien image (si dispo)\r"
    // Le séparateur est ','
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim(); // Trim pour enlever les espaces blancs/sauts de ligne
        if (line === "") continue; // Ignorer les lignes vides
        
        const columns = line.split(","); // Séparer par la virgule
        
        if (columns.length >= 5) { // S'assurer que nous avons au moins 5 colonnes
            // Votre code de parsing initial :
            const numberColumn = columns[2].trim();
            
            // On vérifie le format du numéro. Il est "N° XXXX".
            // split(" ")[1] est correct si la colonne est "N° XXXX", mais fragile.
            const numberMatch = numberColumn.match(/(\d+)$/); // Extrait la séquence de chiffres à la fin
            const number = numberMatch ? numberMatch[1] : '';

            result.push({
                date: columns[0].trim(), 
                year: columns[1].trim(), 
                number: number, // Utilisation de l'extraction plus robuste
                link: columns[3].trim(), 
                image: columns[4].trim() 
            });
        }
    }
    return result;
}

// ... Reste du code (qui ne nécessite pas de modification) ...

fetchSheetData().then(() => {
    // ... Tri et affichage ...
    console.log("Les données sont chargées et prêtes à être affichées :", globalSheetData.length, "éléments.");
    
    // Le reste de votre code DOM va s'exécuter ici.
    globalSheetData.sort((a, b) => {
        return parseInt(a.number) - parseInt(b.number);
    }).reverse();
    globalSheetData = globalSheetData.filter(item => item.link !== "" && item.image !== "");
    
    const carrousselElementsDiv = document.querySelector(".carroussel-elements");
    if (carrousselElementsDiv) { // S'assurer que l'élément DOM existe
         carrousselElementsDiv.innerHTML = ""; // Optionnel : pour effacer un message de chargement
    }

    globalSheetData.forEach(item => {
        // ... création des éléments DOM ...
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