async function chargerCalendrier() {
    const sheetId = '1fon3ys-2OU6PCoxAi3nBObV2edTx4Y5I6JI60FBg9uY';
    const gid = '1274346425'; 
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

    const zonePdf = document.getElementById('zone-pdf');

    try {
        const res = await fetch(url);
        const text = await res.text();
        
        // Extraction sécurisée du JSON Google
        const matches = text.match(/google\.visualization\.Query\.setResponse\((.*)\)/);
        if (!matches) throw new Error("Format de réponse Google invalide");
        
        const json = JSON.parse(matches[1]);
        const rows = json.table.rows;

        // Recherche de la ligne avec "X" dans la colonne C (index 2)
        const ligneChoisie = rows.find(row => {
            return row.c[2] && row.c[2].v && row.c[2].v.toString().trim().toUpperCase() === 'X';
        });

        if (ligneChoisie && ligneChoisie.c[1]) {
            let lienBrut = ligneChoisie.c[1].v;

            // Extraction de l'ID du fichier (format universel Drive)
            const idMatch = lienBrut.match(/\/d\/(.+?)\//) || lienBrut.match(/id=(.+?)(&|$)/);
            
            if (idMatch && idMatch[1]) {
                const idFichier = idMatch[1];
                const lienPreview = `https://drive.google.com/file/d/${idFichier}/preview`;

                zonePdf.innerHTML = `
                    <div style="width:100%; max-width:1000px; margin: 0 auto;">
                        <iframe src="${lienPreview}" 
                                width="100%" 
                                height="800px" 
                                style="border: 2px solid #333; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" 
                                allow="autoplay">
                        </iframe>
                        <div style="margin-top: 20px;">
                            <a href="${lienBrut}" target="_blank" 
                               style="display:inline-block; text-decoration:none; padding: 12px 25px; background-color: #004a99; color: white; border-radius: 5px; font-weight: bold; font-family: sans-serif;">
                                📥 Ouvrir / Télécharger le PDF
                            </a>
                        </div>
                    </div>`;
            } else {
                zonePdf.innerHTML = "Erreur : Le lien Google Drive dans le tableau est mal formaté.";
            }
        } else {
            zonePdf.innerHTML = "Aucun calendrier n'est actuellement sélectionné dans le tableau de gestion.";
        }

    } catch (e) {
        console.error("Erreur de chargement:", e);
        zonePdf.innerHTML = "Désolé, une erreur est survenue lors de la récupération du calendrier.";
    }
}

// Lancement au chargement de la page
document.addEventListener('DOMContentLoaded', chargerCalendrier);