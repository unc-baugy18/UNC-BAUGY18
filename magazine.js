const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSztBiOrLFMqZs_7g2TGdM1UxlnKoTbO7WtaQdFiODdqNe9YcVWr_rZx7ojWIqTKzychK_i1DohWD1w/pub?output=csv&gid=284553090";
const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(sheetURL)}`;
var globalSheetData;
// Dans loadSheetData, après avoir rempli globalSheetData :

async function fetchSheetData() {
    try {
        const response = await fetch(proxyURL,{mode: 'cors'});
        const data = await response.json();
        const sheetContent = data.contents;
        const base64Match = sheetContent.match(/data:text\/csv;base64,([^"]+)/);
        const base64Data = atob(base64Match[1]);
        const uint8Array = new Uint8Array(base64Data.length);
        for (let i = 0; i < base64Data.length; i++) {
            uint8Array[i] = base64Data.charCodeAt(i);
        }
        const decodedCSV = new TextDecoder('utf-8').decode(uint8Array);
        globalSheetData = parseCSV(decodedCSV);
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        globalSheetData = [];
    }
}

function parseCSV(csv) {
  const lines = csv.split("\n");
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].split(",");
    if (line.length >= 2) {
      result.push({
        date: line[0].trim(),  // Première colonne = date
        year: line[1].trim(),  // Deuxième colonne = annee
        number: line[2].trim().split(" ")[1],  // Troisième colonne = numéro
        link: line[3].trim(),  // Quatrième colonne = lien
        image: line[4].trim() // Cinquième colonne = image
      });
    }
  }
  return result;
}


fetchSheetData().then(() => {
    globalSheetData.sort((a, b) => {
        return parseInt(a.number) - parseInt(b.number);
    });
    globalSheetData = globalSheetData.filter(item => item.link !== "" && item.image !== "");
    
    const carrousselElementsDiv = document.querySelector(".carroussel-elements");
    // const carrousselTrackDiv = document.querySelector(".carroussel-track");
    // const carrousselDiv = document.querySelector(".carroussel");
    // const leftArrow = document.querySelector(".carroussel button.left");
    // const rightArrow = document.querySelector(".carroussel button.right");

    
    // let currentTranslate = 0;
    // let prevTranslate = 0;
    // let isDragging = false;
    
    // function calculateLimits() {
    //     const cardMagazine = document.querySelector('.card-magazine');
    //     const slideWidth = 165;
    //     const ContainerWidth = slideWidth + 10;
    //     const totalSlides = globalSheetData.length;
    //     const maxTranslate = ContainerWidth - totalSlides * slideWidth + 20;
    //     return { slideWidth, maxTranslate };
    // }

    // let slideWidth, maxTranslate;
    // ({ slideWidth, maxTranslate } = calculateLimits());


    globalSheetData.forEach(item => {
        const carrousselCardDiv = document.createElement("a");
        // carrousselCardDiv.addEventListener('mousedown', (e) => {
        //     startTime = Date.now();
        //     isClick = true;
        // });

        // carrousselCardDiv.addEventListener('click', (e) => {
        //     const elapsedTime = Date.now() - startTime;
        //     if (isDragging || elapsedTime > 200) {
        //         e.preventDefault();
        //     }
        // });
        carrousselCardDiv.href = item.link;
        carrousselCardDiv.classList.add("card-magazine");
        carrousselCardDiv.innerHTML = `<div class="card-magazine-image">
                                            <img src="${item.image}" alt="${item.number}" onerror="this.onerror=null;this.src='https://placehold.co/165x230/aabbcc/ffffff?text=n°${item.number}';">
                                       </div>
                                       <p>${item.date} ${item.year}</p>`;  
        carrousselElementsDiv.appendChild(carrousselCardDiv);
    });

    // carrousselDiv.addEventListener('touchstart', function(e) {
    //     touchStartX = e.changedTouches[0].screenX;
    //     startPos = currentTranslate;
    //     isDragging = true;
    //     carrousselDiv.style.cursor = 'grabbing';
    //     carrousselElementsDiv.style.transition = 'none';
    //     e.preventDefault();
    // }, {passive: false});

    // carrousselDiv.addEventListener('touchmove', function(e) {
    //     if (!isDragging) return;
    //     touchEndX = e.changedTouches[0].screenX;
    //     const diff = touchEndX - touchStartX;
    //     currentTranslate = startPos + diff;

    //     if (currentTranslate > 0) {
    //         currentTranslate = 0;
    //     } else if (currentTranslate < maxTranslate) {
    //         currentTranslate = maxTranslate;
    //     }

    //     carrousselElementsDiv.style.transform = `translateX(${currentTranslate}px)`;
    //     e.preventDefault();
    // }, {passive: false});

    // carrousselDiv.addEventListener('touchend', function(e) {
    //     if (!isDragging) return;
    //     isDragging = false;
    //     prevTranslate = currentTranslate;
    //     carrousselDiv.style.cursor = 'grab';
    //     carrousselElementsDiv.style.transition = 'transform 0.3s ease-out';

    //     const diff = touchEndX - touchStartX;
    //     if (diff > 50) {
    //         if (currentTranslate < 0) {
    //             currentTranslate += slideWidth;
    //             if (currentTranslate > 0) currentTranslate = 0;
    //             carrousselElementsDiv.style.transform = `translateX(${currentTranslate}px)`;
    //         }
    //     } else if (diff < -50) {
    //         if (currentTranslate > maxTranslate) {
    //             currentTranslate -= slideWidth;
    //             if (currentTranslate < maxTranslate) currentTranslate = maxTranslate;
    //             carrousselElementsDiv.style.transform = `translateX(${currentTranslate}px)`;
    //         }
    //     }

    //     updateArrowStates(maxTranslate);
    // });

    // carrousselDiv.addEventListener('mousedown', startDrag);
    // document.addEventListener('mousemove', drag);
    // document.addEventListener('mouseup', endDrag);

    // carrousselTrackDiv.addEventListener('wheel', handleWheel, { passive: false });

    // leftArrow.addEventListener('click', function() {
    //     if (currentTranslate === 0) return;
    //     currentTranslate += slideWidth;
    //     if (currentTranslate > 0) currentTranslate = 0;
    //     carrousselElementsDiv.style.transform = `translateX(${currentTranslate}px)`;
    //     prevTranslate = currentTranslate;
    //     updateArrowStates(maxTranslate);
    // });

    // rightArrow.addEventListener('click', function() {
    //     if (currentTranslate === maxTranslate) return;
    //     currentTranslate -= slideWidth;
    //     if (currentTranslate < maxTranslate) currentTranslate = maxTranslate;
    //     carrousselElementsDiv.style.transform = `translateX(${currentTranslate}px)`;
    //     prevTranslate = currentTranslate;
    //     updateArrowStates(maxTranslate);
    // });

    // function startDrag(e) {
    //     if (e.button !== 0) return;
    //     isDragging = true;
    //     isClick = false;
    //     startPos = e.clientX;
    //     prevTranslate = currentTranslate;
    //     carrousselDiv.style.cursor = 'grabbing';
    //     carrousselElementsDiv.style.transition = 'none';
    //     e.preventDefault();
    // }

    // function drag(e) {
    //     if (!isDragging) return;
    //     currentTranslate = prevTranslate + e.clientX - startPos;

    //     if (currentTranslate > 0) {
    //         currentTranslate = 0;
    //     } else if (currentTranslate < maxTranslate) {
    //         currentTranslate = maxTranslate;
    //     }

    //     carrousselElementsDiv.style.transform = `translateX(${currentTranslate}px)`;
    //     console.log(`currentTranslate: ${currentTranslate}, maxTranslate: ${maxTranslate}`);
    //     e.preventDefault();
    // }

    // function endDrag() {
    //     if (!isDragging) return;
    //     isDragging = false;
    //     prevTranslate = currentTranslate;
    //     carrousselDiv.style.cursor = 'grab';
    //     carrousselElementsDiv.style.transition = 'transform 0.3s ease-out';
    //     updateArrowStates(maxTranslate);
    // }

    // function handleWheel(e) {
    //     e.preventDefault();
    //     const delta = e.deltaY || e.deltaX;
    //     if (delta > 0) {
    //         currentTranslate -= slideWidth;
    //         if (currentTranslate < maxTranslate) currentTranslate = maxTranslate;
    //     } else {
    //         currentTranslate += slideWidth;
    //         if (currentTranslate > 0) currentTranslate = 0;
    //     }
    //     carrousselElementsDiv.style.transform = `translateX(${currentTranslate}px)`;
    //     prevTranslate = currentTranslate;
    //     updateArrowStates(maxTranslate);
    // }

    // function updateArrowStates() {
    //     leftArrow.disabled = currentTranslate === 0;
    //     rightArrow.disabled = currentTranslate === maxTranslate;
    // }

    // updateArrowStates();

});
