async function chargerCalendrier() {
    const sheetId = '1fon3ys-2OU6PCoxAi3nBObV2edTx4Y5I6JI60FBg9uY';
    const gid = '1274346425'; 
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

    try {
        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));

        // Recherche de la ligne avec le "X"
        // On vérifie la colonne C (index 2) pour le "X"
        const ligneSelectionnee = json.table.rows.find(row => {
            return row.c[2] && (row.c[2].v === 'X' || row.c[2].v === 'x');
        });

        const zonePdf = document.getElementById('zone-pdf');

        if (ligneSelectionnee && ligneSelectionnee.c[1]) {
            let lienPdf = ligneSelectionnee.c[1].v;

            // Transformation du lien Drive pour l'intégration (preview)
            if (lienPdf.includes('file/d/')) {
                const idMatch = lienPdf.match(/\/d\/(.+?)\//);
                if (idMatch) {
                    lienPdf = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
                }
            }

            zonePdf.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <iframe src="${lienPdf}" width="100%" height="800px" allow="autoplay" style="border: 2px solid #ccc; border-radius: 8px;"></iframe>
                </div>
                <a href="${ligneSelectionnee.c[1].v}" target="_blank" class="btn-retour" style="display:inline-block; text-decoration:none;">
                    📥 Télécharger / Voir en plein écran
                </a>
            `;
        } else {
            zonePdf.innerHTML = "Aucun calendrier n'est actuellement marqué d'un 'X' dans la colonne Choix.";
        }
    } catch (e) {
        console.error("Erreur de chargement:", e);
        document.getElementById('zone-pdf').innerHTML = "Erreur de connexion aux données du calendrier.";
    }
}

document.addEventListener('DOMContentLoaded', chargerCalendrier);