document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.querySelector('.cards-grid');

    async function loadPets(filters = {}) {
        try {
            grid.innerHTML = '<p style="margin:20px;">Loading pets...</p>';
            const pets = await API.getPets(filters);

            grid.innerHTML = '';
            if (pets.length === 0) {
                grid.innerHTML = '<p style="margin:20px;">No pets found matching your criteria.</p>';
                return;
            }

            pets.forEach(pet => {
                const card = document.createElement('article');
                card.className = 'pet-card';
                card.innerHTML = `
                    <div class="pet-img-wrap">
                      <img src="${pet.image || 'https://placehold.co/400'}" alt="${pet.name}" />
                      <div class="badge-new">New</div>
                      <div class="favorite-btn"><i class="fa-regular fa-heart"></i></div>
                    </div>
                    <div class="pet-body">
                      <div class="pet-name">${pet.name}</div>
                      <div class="pet-location"><i class="fa-solid fa-location-dot"></i> Available</div>
                      <div class="meta-row">
                        <span class="meta-label">Gender:</span><span>${pet.gender}</span>
                        <span class="meta-label">Age:</span><span>${pet.age} years</span>
                      </div>
                      <div class="meta-row">
                        <span class="meta-label">Breed:</span><span class="meta-tag">${pet.breed}</span>
                      </div>
                      <p class="pet-desc">${pet.reason_behind_rehome || 'Looking for a lovely home.'}</p>
                    </div>
                    <div class="card-footer">
                      <button class="btn-more-info" onclick="adoptPet('${pet.rehome_id}')">Adopt Now</button>
                    </div>
                `;
                grid.appendChild(card);
            });
        } catch (error) {
            grid.innerHTML = '<p style="margin:20px; color:red;">Failed to load pets.</p>';
        }
    }

    // Initial load
    loadPets();

    // Wire filters (Example for Type: Dog/Cat)
    const typePills = document.querySelectorAll('.pet-type-pill');
    typePills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Toggle active class
            typePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            // Fetch with filter
            const type = pill.querySelector('span').innerText.toLowerCase(); // 'Cat' or 'Dog'
            loadPets({ type });
        });
    });

    // Reset filters
    document.querySelector('.filters-reset').addEventListener('click', () => {
        loadPets({});
    });
});

async function adoptPet(id) {
    // Check if logged in
    try {
        await API.getMe();
        // If logged in, maybe show a modal or redirect to a specific application page?
        // For simplicity, let's just use window prompt or assume there's a modal.
        // Or we can just redirect to rehome.html? No, that's for GIVING UP.
        // We implemented api/adopt POST. We need a UI for it.
        // Let's create a simple prompt-based application for now or assume a modal exists.
        // Since I don't have a modal in the HTML:
        const phone = prompt("Enter your phone number to apply:");
        if (phone) {
            try {
                await API.adopt({
                    animalId: id,
                    phone: phone,
                    numChildren: 0,
                    numAdults: 1,
                    homeImage: '',
                    animalProof: 'yes',
                    otherPets: 'no',
                    otherPetsSpayed: 'no',
                    allergies: 'no'
                });
                alert('Adoption application submitted!');
            } catch (e) {
                alert('Error submitting application: ' + e.message);
            }
        }
    } catch (e) {
        alert('Please login to adopt');
        window.location.href = 'login.html';
    }
}
