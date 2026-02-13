
const Photo_path = 'UNC%20de%20Baugy_fichiers/photos/';
let globalData = [];

async function initialiserContact() {
    const sheetId = '1fon3ys-2OU6PCoxAi3nBObV2edTx4Y5I6JI60FBg9uY';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=109617783`;
    try {
        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));

        for (const item of json.table.rows) {
            console.log((item.c[0]?.v || "Membre") +": " + item.c[2]?.v + " " + item.c[3]?.v);
        }

        globalData = json.table.rows.map(row => ({
                fonction: row.c[0]?.v || "Membre",
                m_mme: row.c[1]?.v || "",
                nom: row.c[2]?.v || "",
                prenom: row.c[3]?.v || "",
                photo: row.c[4]?.v || "default-avatar.png",
                email: row.c[5]?.v || "",
                group: parseInt(row.c[6]?.v) || 99
        })).filter(item => item.nom && item.prenom && item.nom !== "Nom");

        const listBureau = globalData.filter(contact => !contact.fonction.toLowerCase().includes('membre'));
        const listMembres = globalData.filter(contact => contact.fonction.toLowerCase().includes('membre'));

        listBureau.sort((a, b) => a.group - b.group);
        listMembres.sort((a, b) => a.nom.localeCompare(b.nom));

        afficherContacts(listBureau, listMembres);
    } catch (e) {
        console.error("Erreur:", e);
        document.getElementById('notre-tableau').innerHTML = "Erreur de connexion aux données.";
    }
}

function afficherContacts(bureau, membres)
{
    const bureauContainer = document.getElementById('bureau-container');
    const membresContainer = document.getElementById('membres-container');

    bureauContainer.innerHTML = '';
    membresContainer.innerHTML = '';

    const createCard = (contact) => {
        const div = document.createElement('div');
        div.classList.add('groupe-indiv-contact');
        const emailHtml = contact.email
            ? `<a href="mailto:${contact.email}" class="contact-email">${contact.email}</a>`
            : '';

        div.innerHTML = `
            <span>${contact.fonction}</span>
            <strong>${contact.m_mme} ${contact.nom} ${contact.prenom}</strong>
            ${emailHtml}
            <img src="${Photo_path}${contact.photo}" alt="Photo" />
        `;
        return div;
    };

    let currentGroupId = null;
    let currentGroupDiv = null;

    bureau.forEach(contact => {
        if (contact.group !== currentGroupId) {
            currentGroupId = contact.group;
            currentGroupDiv = document.createElement('div');
            currentGroupDiv.classList.add('bureau-group');
            bureauContainer.appendChild(currentGroupDiv);
        }
        currentGroupDiv.appendChild(createCard(contact));
    });
    membres.forEach(c => membresContainer.appendChild(createCard(c)));
}


document.addEventListener('DOMContentLoaded', initialiserContact);