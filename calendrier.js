async function chargerCalendrier() {
    const sheetId = '1fon3ys-2OU6PCoxAi3nBObV2edTx4Y5I6JI60FBg9uY';
    const gid = '1274346425'; 
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

    const zonePdf = document.getElementById('zone-pdf');

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Impossible d'accéder au fichier Google Sheet.");
        
        const text = await res.text();
        
        // Nettoyage de la réponse JSON de Google
        const jsonText = text.substr(47).slice(0, -2);
        const json = JSON.parse(jsonText);

        const rows = json.table.rows;
        console.log("Lignes trouvées :", rows); // Visible dans la console (F12)

        // On cherche le "X" (on teste plusieurs colonnes par sécurité : index 2 ou 3)
        let ligneSelectionnee = rows.find(row => {
            // Test colonne C (index 2) ou D (index 3)
            const colC = row.c[2] ? row.c[2].v : null;
            const colD = row.c[3] ? row.c[3].v : null;
            return (colC === 'X' || colC === 'x' || colD === 'X' || colD === 'x');
        });

        if (ligneSelectionnee) {
            // On récupère le lien (souvent en colonne B index 1)
            let lienBrut = ligneSelectionnee.c[1] ? ligneSelectionnee.c[1].v : null;

            if (lienBrut) {
                // Transformation du lien pour l'affichage (remplace view par preview)
                let lienPreview = lienBrut.replace(/\/view\?usp=sharing|\/view/g, "/preview");

                zonePdf.innerHTML = `
                    <div style="width:100%; max-width:900px; margin:auto;">
                        <iframe src="${lienPreview}" width="100%" height="700px" style="border:1px solid #ddd; border-radius:8px;"></iframe>
                    </div>`;
            } else {
                zonePdf.innerHTML = "Ligne trouvée avec 'X', mais le lien PDF est vide ou mal placé.";
            }
        } else {
            zonePdf.innerHTML = "Aucun calendrier n'est coché avec un 'X' dans l'onglet Calendriers.";
        }

    } catch (e) {
        console.error(e);
        zonePdf.innerHTML = "Erreur technique : " + e.message;
    }
}

document.addEventListener('DOMContentLoaded', chargerCalendrier);