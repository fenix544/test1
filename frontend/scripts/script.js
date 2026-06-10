var currentPage = 0;
var currentSize = 10;
var currentSort = "id,desc";
var totalPages = 0;
var searchTerm = "";

const API_URL = "http://13.60.12.198:8080/api/v1/offers";

document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    currentSize = urlParams.get('size') || 10;
    currentPage = urlParams.get('page') || 0;
    currentSort = urlParams.get('sort') || "id,desc";

    const localSort = localStorage.getItem('sort');
    if (localSort) currentSort = localSort;

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = currentSort;

    await loadOffers();

    document.getElementById('searchInput').addEventListener('keydown', async function (event) {
        if (event.key === 'Enter') {
            currentPage = 0;
            await searchOffers();
        }
    });
});

async function changeSort() {
    currentSort = document.getElementById('sortSelect').value;
    currentPage = 0;
    localStorage.setItem('sort', currentSort);
    if (searchTerm.length < 3) {
        await loadOffers();
    } else {
        await searchOffers();
    }
}

async function loadOffers() {
    const offersListElement = document.querySelector('.offers-list');
    offersListElement.innerHTML = '';

    const loaderContainer = document.querySelector(".loader-container");
    loaderContainer.style.display = 'flex';

    try {
        const response = await fetch(`${API_URL}?page=${currentPage}&size=${currentSize}&sort=${currentSort}`);
        await renderOffers(response, loaderContainer, offersListElement);
    } catch (e) {
        showError("Błąd podczas ładowania danych: " + e);
    }
}

async function searchOffers() {
    const searchInputElement = document.getElementById('searchInput');
    searchTerm = searchInputElement.value;

    const offersListElement = document.querySelector('.offers-list');
    offersListElement.innerHTML = '';

    const loaderContainer = document.querySelector(".loader-container");
    loaderContainer.style.display = 'flex';

    const searchTermEl = document.querySelector(".search-term");

    if (searchTerm.length < 3) {
        currentPage = 0;
        searchTermEl.style.display = "none";
        await loadOffers();
        return;
    }

    searchTermEl.style.display = "block";
    searchTermEl.textContent = "Wyszukana fraza: " + searchTerm;

    try {
        const response = await fetch(`${API_URL}?size=${currentSize}&page=${currentPage}&search=${searchTerm}&sort=${currentSort}`);
        await renderOffers(response, loaderContainer, offersListElement);
    } catch (e) {
        showError("Błąd podczas ładowania danych: " + e);
    }
}

function showError(message) {
    const errorContainer = document.querySelector(".error-container");
    errorContainer.style.display = 'flex';
    document.querySelector(".loader-container").style.display = 'none';
    errorContainer.querySelector('p').textContent = message;
}

async function renderOffers(response, loaderContainer, offersListElement) {
    const offers = await response.json();

    if (!response.ok) {
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.style.display = 'flex';
        loaderContainer.style.display = 'none';

        const errorMessageParagraph = errorContainer.querySelector('p');

        if (response.status.toString().startsWith('5')) {
            errorMessageParagraph.textContent = "Błąd serwera. Spróbuj ponownie później.";
        } else {
            const responseMessage = await response.text();
            errorMessageParagraph.textContent = "Błąd podczas ładowania danych. Odpowiedź: " + responseMessage;
        }

        return;
    }

    totalPages = offers.page['totalPages'];
    currentPage = offers.page['number'];

    this.updatePaginationSection();

    loaderContainer.style.display = 'none';

    if (!offers.content || offers.content.length === 0) {
        offersListElement.innerHTML = '<h2 style="text-align: center; width: 100%; margin-top: 150px; font-weight: normal; color: #666;">Żadne oferty nie pasują do podanej frazy :( </h2>';
        return;
    }

    const template = document.getElementById('jobCardTemplate');

    offers.content.forEach(offer => {
        const earningsValue = offer['earnings'] || 0;
        const formattedEarnings = earningsValue.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + " PLN";

        const clonedJobCard = template.content.cloneNode(true);
        const jobCardElement = clonedJobCard.querySelector('.job-card');

        jobCardElement.addEventListener('click', () => {
            window.location.href = `details.html?id=${offer.id}`;
        });

        clonedJobCard.querySelector('h2').textContent = offer.title;

        const metadataSpans = clonedJobCard.querySelectorAll('.job-meta .meta-item span');
        metadataSpans[0].textContent = offer['company'];
        metadataSpans[1].textContent = offer['location'];
        metadataSpans[2].textContent = offer['creationDate'] ? offer['creationDate'].replace("T", " ") : "";

        clonedJobCard.querySelector('.salary-range').textContent = formattedEarnings;
        offersListElement.appendChild(clonedJobCard);
    });
}

function updatePaginationSection() {
    document.getElementById('nextPage').disabled = currentPage === totalPages - 1;
    document.getElementById('previousPage').disabled = currentPage === 0;

    document.getElementById("pageNumber").value = currentPage;
}

async function nextPage() {
    this.currentPage++;
    this.updatePaginationSection();
    if (searchTerm.length < 3) {
        await this.loadOffers();
    } else {
        await this.searchOffers();
    }
}

async function previousPage() {
    this.currentPage--;
    this.updatePaginationSection();
    if (searchTerm.length < 3) {
        await this.loadOffers();
    } else {
        await this.searchOffers();
    }
}