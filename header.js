const sheetIdHeader = '1fon3ys-2OU6PCoxAi3nBObV2edTx4Y5I6JI60FBg9uY';
const urlHeader = `https://docs.google.com/spreadsheets/d/${sheetIdHeader}/gviz/tq?tqx=out:json&gid=747771106`;

async function chargerMenuAnnees() {
    try {
        const res = await fetch(urlHeader);
        const text = await res.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));

        const annees = [...new Set(json.table.rows.map(row =>
            row.c[0] && row.c[0].v ? row.c[0].v.toString() : null
        ))].filter(a => a && a !== "Année").sort().reverse();

        const dropdown = document.getElementById('dropdown-annees');
        const btnPhoto = document.getElementById('btn-photo-principale');

        if (annees.length > 0) {
            btnPhoto.href = `archives-photos.html?annee=${annees[0]}`;
        }

        annees.forEach(a => {
            const link = document.createElement('a');
            link.href = `archives-photos.html?annee=${a}`;
            link.textContent = a;
            dropdown.appendChild(link);
        });
    } catch (e) { console.error("Erreur Header:", e); }
}

document.addEventListener('DOMContentLoaded', chargerMenuAnnees);