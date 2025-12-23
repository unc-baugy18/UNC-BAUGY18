let globalData = [];

function extraireIdDrive(lien) {
    if (typeof lien !== 'string') return null;
    const match = lien.match(/[-\w]{25,}/);
    return match ? match[0] : null;
}

async function initialiserGalerie() {
    const sheetId = '1fon3ys-2OU6PCoxAi3nBObV2edTx4Y5I6JI60FBg9uY';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=747771106`;
    try {
        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));

        for (const item of json.table.rows) {
            console.log(item.c[1]?.v);
        }

        globalData = json.table.rows.map(row => {
            const annee = row.c[0] && row.c[0].v ? row.c[0].v.toString() : "";
            const evenement = row.c[1]?.v || "";
            return {
                annee: annee,
                evenement: evenement,
                cleUnique: `${annee}|${evenement}`.replace(/'/g, "\\'"),
                nomFichier: row.c[2]?.v || "Image",
                lien: row.c[3]?.v,
                isCover: row.c[5]?.v === 'X'
            };
        }).filter(item => item.annee && item.annee !== "Année");

        analyserURL();
    } catch (e) {
        console.error("Erreur:", e);
        document.getElementById('notre-tableau').innerHTML = "Erreur de connexion aux données.";
    }
}

window.onpopstate = function() {
    analyserURL();
};

function analyserURL() {
    const params = new URLSearchParams(window.location.search);
    const annee = params.get('annee');
    const cle = params.get('cle');

    if (cle) {
        afficherGalerie(cle, false);
    } else if (annee) {
        afficherEvenements(annee, false);
    } else {
        afficherAnnees(false);
    }
}


function afficherAnnees(updateHistory = true) {

    if (updateHistory) history.pushState({view: 'home'}, '', window.location.pathname);
    const annees = [...new Set(globalData.map(d => d.annee))].sort().reverse();
    let html = '<h2 class="title">Archives</h2><div class="menu-annees">';
    annees.forEach(a => {
        html += `<button class="btn-annee" onclick="afficherEvenements('${a}')">${a}</button>`;
    });
    document.getElementById('notre-tableau').innerHTML = html + '</div>';
}

function afficherEvenements(anneeSelectionnee, updateHistory = true) {
    if (updateHistory) history.pushState({annee: anneeSelectionnee}, '', `?annee=${anneeSelectionnee}`);
    const dataAnnee = globalData.filter(d => d.annee === anneeSelectionnee);
    const clesUnique = [...new Set(dataAnnee.map(d => d.cleUnique))];
    let html = `<button class="btn-retour" onclick="window.location.href='/'">⬅ Retour</button>
                <h2 class="title">${anneeSelectionnee}</h2>
                <div class="grid-events">`;
    clesUnique.forEach(cle => {
        const photos = dataAnnee.filter(d => d.cleUnique === cle);
        const cover = photos.find(d => d.isCover) || photos[0];
        const idImg = extraireIdDrive(cover.lien);
        const thumb = idImg ? `https://lh3.googleusercontent.com/d/${idImg}=s600` : '';

        html += `
            <div class="card-event" onclick="afficherGalerie('${cle}')">
                <div class="card-img-container">
                    <img src="${thumb}" loading="lazy">
                    <div class="badge">${photos.length} photos</div>
                </div>
                <div class="card-info-photo">
                    <p class="event-name">${cover.evenement}</p>
                </div>
            </div>`;
    });
    document.getElementById('notre-tableau').innerHTML = html + '</div>';
}

function afficherGalerie(cleSelectionnee, updateHistory = true) {
    const images = globalData.filter(d => d.cleUnique === cleSelectionnee);
    if (images.length === 0) return;

    if (updateHistory) history.pushState({cle: cleSelectionnee}, '', `?cle=${encodeURIComponent(cleSelectionnee)}`);
    const anneeActive = images[0].annee;
    const nomEvenement = images[0].evenement;

    let html = `<button class="btn-retour" onclick="afficherEvenements('${anneeActive}')">⬅ Retour</button>
                <h2 class="title">${nomEvenement}</h2>
                <div class="masonry-gallery">`;
    images.forEach(img => {
        const idImg = extraireIdDrive(img.lien);
        if(idImg) {
            const thumb = `https://lh3.googleusercontent.com/d/${idImg}=s800`;
            html += `
                <div class="masonry-item">
                    <a href="${img.lien}" target="_blank">
                        <img src="${thumb}" alt="${img.nomFichier}" loading="lazy">
                    </a>
                </div>`;
        }
    });
    document.getElementById('notre-tableau').innerHTML = html + '</div>';
}

document.addEventListener('DOMContentLoaded', initialiserGalerie);