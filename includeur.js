fetch("./header.html")
    .then(response => response.text())
    .then(data => {
        document.querySelector("header").innerHTML = data;
        const currentPage = document.body.getAttribute('data-page');
        const navLinks = document.querySelectorAll('header a[data-target]');
        navLinks.forEach(link => {
            if (link.getAttribute('data-target') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    });

fetch("./footer.html")
    .then(response => response.text())
    .then(data => {
        document.querySelector("footer").innerHTML = data;
    });
