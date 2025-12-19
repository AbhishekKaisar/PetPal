const API = {
    async request(url, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    register(fullName, email, password) {
        return this.request('/api/auth/register', 'POST', { fullName, email, password });
    },

    login(email, password) {
        return this.request('/api/auth/login', 'POST', { email, password });
    },

    logout() {
        return this.request('/api/auth/logout', 'POST');
    },

    getMe() {
        return this.request('/api/auth/me');
    },

    getPets(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        return this.request(`/api/pets?${query}`);
    },

    createPet(petData) {
        return this.request('/api/pets', 'POST', petData);
    },

    deletePet(id) {
        return this.request(`/api/pets/${id}`, 'DELETE');
    },

    adopt(applicationData) {
        return this.request('/api/adopt', 'POST', applicationData);
    },

    getAdoptionRequests() {
        return this.request('/api/adopt');
    },

    deleteAdoptionRequest(id) {
        return this.request(`/api/adopt?id=${id}`, 'DELETE');
    }
};

// Check auth status on load and update UI (simple implementation)
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await API.getMe();
        if (user) {
            updateAuthUI(user);
        }
    } catch (e) {
        // Not logged in
    }
});

function updateAuthUI(user) {
    const authLinks = document.querySelector('.auth-links');
    if (authLinks) {
        authLinks.innerHTML = `<span>Welcome, ${user.name.split(' ')[0]}</span> | <a href="#" onclick="handleLogout()">Logout</a>`;
    }
    const rightPanelText = document.querySelector('.right-panel-text'); // For login page
    if (rightPanelText) rightPanelText.textContent = `Welcome back, ${user.name}`;
}

async function handleLogout() {
    try {
        await API.logout();
        window.location.reload();
    } catch (e) {
        alert('Logout failed');
    }
}
