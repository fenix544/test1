const API_URL = "http://13.60.12.198:8080/api/v1/offers";
let currentPage = 0;
const pageSize = 10;
let asd = 0;
document.addEventListener('DOMContentLoaded', () => {
    loadAdminOffers();
});

async function loadAdminOffers() {
    try {
        const response = await fetch(`${API_URL}?page=${currentPage}&size=${pageSize}`);
        const offersPage = await response.json();

        const listContainer = document.getElementById('adminOffersList');
        const template = document.getElementById('offerCardTemplate');

        listContainer.innerHTML = '';

        if (offersPage.content) {
            offersPage.content.forEach(offer => {
                const clone = template.content.cloneNode(true);

                clone.querySelector('.offer-title-company').textContent = `${offer.title} - ${offer.company}`;
                clone.querySelector('.admin-offer-location').textContent = offer.location;

                const earningsValue = offer.earnings || 0;
                const formattedEarnings = earningsValue.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') + " PLN";
                clone.querySelector('.admin-offer-earnings').textContent = ` | ${formattedEarnings}`;

                clone.querySelector('.edit-btn').addEventListener('click', () => {
                    setupEdit(offer.id, offer.title, offer.company, offer.earnings, offer.location, offer.description);
                });

                clone.querySelector('.delete-btn').addEventListener('click', () => {
                    deleteOffer(offer.id);
                });

                listContainer.appendChild(clone);
            });
        }

        if (offersPage.page) {
            renderPagination(offersPage.page.totalPages, offersPage.page.number);
        }

    } catch (error) {
        console.error(error);
    }
}

function renderPagination(totalPages, currentServerPage) {
    const paginationContainer = document.getElementById('paginationControls');
    paginationContainer.innerHTML = '';

    if (totalPages === 0) return;

    if (currentServerPage > 0) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Poprzednia';
        prevBtn.addEventListener('click', () => {
            currentPage--;
            loadAdminOffers();
            window.scrollTo(0, 0);
        });
        paginationContainer.appendChild(prevBtn);
    }

    const infoSpan = document.createElement('span');
    infoSpan.textContent = `Strona ${currentServerPage + 1} z ${totalPages} `;
    paginationContainer.appendChild(infoSpan);

    if (currentServerPage < totalPages - 1) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Następna';
        nextBtn.addEventListener('click', () => {
            currentPage++;
            loadAdminOffers();
            window.scrollTo(0, 0);
        });
        paginationContainer.appendChild(nextBtn);
    }
}

document.getElementById('offerForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const id = document.getElementById('offerId').value;

    const offerData = {
        title: document.getElementById('title').value,
        company: document.getElementById('company').value,
        earnings: document.getElementById('earnings').value,
        location: document.getElementById('location').value,
        description: document.getElementById('description').value
    };

    if (id) {
        await editOffer(id, offerData);
    } else {
        await addOffer(offerData);
    }
});

async function addOffer(data) {
    try {
        const response = await fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Oferta dodana pomyślnie!');
            cancelForm();
            loadAdminOffers();
        }
    } catch (error) {
        console.error(error);
    }
}

async function editOffer(id, data) {
    try {
        const response = await fetch(`${API_URL}/edit/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Oferta zaktualizowana!');
            cancelForm();
            loadAdminOffers();
        }
    } catch (error) {
        console.error(error);
    }
}

async function deleteOffer(id) {
    if (confirm('Czy na pewno chcesz usunąć tę ofertę?')) {
        try {
            const response = await fetch(`${API_URL}/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Oferta usunięta.');

                const listContainer = document.getElementById('adminOffersList');
                if (listContainer.children.length === 1 && currentPage > 0) {
                    currentPage--;
                }

                loadAdminOffers();
            }
        } catch (error) {
            console.error(error);
        }
    }
}

function showSection(sectionId, clickedButton = null) {
    document.getElementById('listSection').classList.add('d-none');
    document.getElementById('formSection').classList.add('d-none');

    document.getElementById(sectionId).classList.remove('d-none');

    if (clickedButton) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');
    }

    if (sectionId === 'formSection' && clickedButton) {
        resetForm();
    }
}

function setupEdit(offerId, title, company, earnings, location, description) {
    document.getElementById('offerId').value = offerId;
    document.getElementById('title').value = title;
    document.getElementById('company').value = company;
    document.getElementById('earnings').value = earnings;
    document.getElementById('location').value = location;
    document.getElementById('description').value = description;

    document.getElementById('formTitle').textContent = 'Edytuj ofertę';

    showSection('formSection');

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (buttons.length > 1) {
        buttons[1].classList.add('active');
    }
}

function resetForm() {
    document.getElementById('offerForm').reset();
    document.getElementById('offerId').value = '';
    document.getElementById('formTitle').textContent = 'Dodaj nową ofertę';
}

function cancelForm() {
    resetForm();
    const listButton = document.querySelectorAll('.nav-btn')[0];
    showSection('listSection', listButton);
}