async function chargerCalendrier() {
    const sheetId = '1fon3ys-2OU6PCoxAi3nBObV2edTx4Y5I6JI60FBg9uY';
    const gid = '1274346425'; 
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

    const zonePdf = document.getElementById('zone-pdf');

    try {
        const res = await fetch(url);
        const text = await res.text();
        
        // Extraction et nettoyage du JSON Google
        const jsonText = text.substr(47).slice(0, -2);
        const json = JSON.parse(jsonText);
        const rows = json.table.rows;

        // On cherche la ligne où la colonne C (index 2) contient "X"
        const ligneChoisie = rows.find(row => {
            return row.c[2] && row.c[2].v && row.c[2].v.toString().trim().toUpperCase() === 'X';
        });

        if (ligneChoisie && ligneChoisie.c[1]) {
            let lienBrut = ligneChoisie.c[1].v;

            // Nettoyage précis du lien pour Google Drive iframe
            // On extrait l'ID du fichier entre /d/ et /view
            const idMatch = lienBrut.match(/\/d\/(.+?)\//);
            
            if (idMatch && idMatch[1]) {
                const idFichier = idMatch[1];
                const lienPreview = `https://drive.google.com/file/d/${idFichier}/preview`;

                zonePdf.innerHTML = `
                    <div style="width:100%; max-width:1000px; margin: 0 auto;">
                        <iframe src="${lienPreview}" width="100%" height="800px" style="border: 2px solid #333; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" allow="autoplay"></iframe>
                        <div style="margin-top: 15px; text-align: center;">
                            <a href="${lienBrut}" target="_blank" class="btn-retour" style="display:inline-block; text-decoration:none; padding: 10px 20px; background-color: #004a99; color: white; border-radius: 5px;">
                                📥 Ouvrir / Télécharger le PDF
                            </a>
                        </div>
                    </div>`;
            } else {
                zonePdf.innerHTML = "Le lien dans le tableau n'est pas au bon format.";
            }
        } else {
            zonePdf.innerHTML = "Aucun calendrier sélectionné (pas de 'X' trouvé dans la colonne choix).";
        }

    } catch (e) {
        console.error("Erreur:", e);
        zonePdf.innerHTML = "Erreur lors de la récupération du calendrier.";
    }
}

document.addEventListener('DOMContentLoaded', chargerCalendrier);