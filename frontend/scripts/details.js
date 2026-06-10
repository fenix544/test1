const API_URL = "http://13.60.12.198:8080/api/v1/offers";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const offerId = urlParams.get('id');
    const mainContainer = document.getElementById('detailsMain');

    if (!offerId) {
        mainContainer.innerHTML = '<div class="error-container" style="display:flex"><p class="error-message">Nie znaleziono oferty. Brak ID w adresie.</p></div>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/get/${offerId}`);

        if (!response.ok) {
            throw new Error('Nie udało się pobrać danych oferty.');
        }

        const offer = await response.json();
        renderOfferDetails(offer);

    } catch (error) {
        mainContainer.innerHTML = `<div class="error-container" style="display:flex"><p class="error-message">${error.message}</p></div>`;
    }
});

function renderOfferDetails(offer) {
    const mainContainer = document.getElementById('detailsMain');
    mainContainer.innerHTML = '';

    const template = document.getElementById('detailsTemplate');
    const clone = template.content.cloneNode(true);

    clone.querySelector('.details-title').textContent = offer.title;
    clone.querySelector('.company-meta strong').textContent = offer.company;
    clone.querySelector('.location-meta strong').textContent = offer.location;

    const date = offer.creationDate ? offer.creationDate.replace("T", " ") : "Brak danych";
    clone.querySelector('.date-meta strong').textContent = date;

    const formattedEarnings = offer.earnings.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
    clone.querySelector('.earnings-meta strong').textContent = formattedEarnings;

    clone.querySelector('.details-description').textContent = offer.description;

    mainContainer.appendChild(clone);
}