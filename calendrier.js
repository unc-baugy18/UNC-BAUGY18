async function chargerCalendrier() {
    const sheetId = '1fon3ys-2OU6PCoxAi3nBObV2edTx4Y5I6JI60FBg9uY';
    const gid = '1274346425'; 
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

    try {
        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));

        // On cherche la ligne qui a "X" dans la colonne "choix" (colonne 2, index 2)
        // Structure supposée : A=Année(0), B=Lien(1), C=Choix(2)
        const ligneSelectionnee = json.table.rows.find(row => {
            return row.c[2] && row.c[2].v === 'X';
        });

        if (ligneSelectionnee && ligneSelectionnee.c[1]) {
            let lienPdf = ligneSelectionnee.c[1].v;

            // Transformation du lien Drive pour l'affichage direct
            // Si c'est un lien de partage classique, on le transforme en mode "preview"
            if (lienPdf.includes('view')) {
                lienPdf = lienPdf.replace('/view', '/preview');
            }

            document.getElementById('zone-pdf').innerHTML = `
                <iframe src="${lienPdf}" width="100%" height="800px" style="border: none; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"></iframe>
                <br>
                <a href="${lienPdf.replace('/preview', '/view')}" target="_blank" class="btn-annee" style="display:inline-block; margin-top:15px; text-decoration:none;">
                    Ouvrir en plein écran / Télécharger
                </a>
            `;
        } else {
            document.getElementById('zone-pdf').innerHTML = "Aucun calendrier sélectionné pour le moment.";
        }
    } catch (e) {
        console.error("Erreur:", e);
        document.getElementById('zone-pdf').innerHTML = "Erreur lors du chargement du calendrier.";
    }
}

document.addEventListener('DOMContentLoaded', chargerCalendrier);