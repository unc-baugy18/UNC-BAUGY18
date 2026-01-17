async function chargerCalendrier() {
    const sheetId = '1fon3ys-2OU6PCoxAi3nBObV2edTx4Y5I6JI60FBg9uY';
    const gid = '1274346425'; 
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

    const zonePdf = document.getElementById('zone-pdf');
    zonePdf.innerHTML = '<div class="loader-calendrier">🔍 Recherche de la dernière version du calendrier...</div>';

    try {
        const res = await fetch(url);
        const text = await res.text();
        const matches = text.match(/google\.visualization\.Query\.setResponse\((.*)\)/);
        
        if (!matches) throw new Error("Erreur format Google");
        
        const json = JSON.parse(matches[1]);
        const rows = json.table.rows;

        const ligneChoisie = rows.find(row => {
            return row.c[2] && row.c[2].v && row.c[2].v.toString().trim().toUpperCase() === 'X';
        });

        if (ligneChoisie && ligneChoisie.c[1]) {
            let lienBrut = ligneChoisie.c[1].v;
            const idMatch = lienBrut.match(/\/d\/(.+?)\//) || lienBrut.match(/id=(.+?)(&|$)/);
            
            if (idMatch && idMatch[1]) {
                const idFichier = idMatch[1];
                const lienPreview = `https://drive.google.com/file/d/${idFichier}/preview`;

                // Injection du nouveau design
                zonePdf.innerHTML = `
                    <div class="calendrier-wrapper">
                        <div class="iframe-container">
                            <iframe src="${lienPreview}" 
                                    width="100%" 
                                    height="100%" 
                                    style="border:none;" 
                                    allow="autoplay">
                            </iframe>
                        </div>
                        <a href="${lienBrut}" target="_blank" class="btn-download">
                            <span>📥</span> Télécharger le calendrier (PDF)
                        </a>
                    </div>`;
            }
        } else {
            zonePdf.innerHTML = "<p>Aucun calendrier n'est disponible pour le moment.</p>";
        }
    } catch (e) {
        zonePdf.innerHTML = "<p>Erreur lors de l'affichage du calendrier. Veuillez réessayer plus tard.</p>";
    }
}

document.addEventListener('DOMContentLoaded', chargerCalendrier);