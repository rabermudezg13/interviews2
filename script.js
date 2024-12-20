// Navigation Functions
function showForm() {
    document.getElementById('formSection').style.display = 'block';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('dataframeSection').style.display = 'none';
}

function showSearch() {
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'block';
    document.getElementById('dataframeSection').style.display = 'none';
}

function showDataframe() {
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('dataframeSection').style.display = 'block';
    updateDataframe();
}

// Form submission
document.getElementById('talentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const talent = {
        name: document.getElementById('name').value,
        id: document.getElementById('id').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        visitDate: document.getElementById('visitDate').value,
        status: document.getElementById('status').value,
        pendingSteps: document.getElementById('pendingSteps').value,
        createdAt: new Date().toISOString()
    };
    
    try {
        await db.collection('talents').add(talent);
        alert('Talent added successfully');
        this.reset();
        showDataframe();
    } catch (error) {
        console.error("Error adding talent: ", error);
        alert('Error adding talent');
    }
});

// Update dataframe
async function updateDataframe() {
    try {
        const snapshot = await db.collection('talents').get();
        const tbody = document.getElementById('dataframeBody');
        tbody.innerHTML = '';

        snapshot.forEach(doc => {
            const talent = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${talent.name}</td>
                <td>${talent.id}</td>
                <td>${talent.phone}</td>
                <td>${talent.email}</td>
                <td>${talent.visitDate}</td>
                <td><span class="status-badge status-${talent.status.toLowerCase().replace(' ', '-')}">${talent.status}</span></td>
                <td>${talent.pendingSteps}</td>
                <td>
                    <button onclick="editTalent('${doc.id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTalent('${doc.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading talents: ", error);
    }
}

// Search talents
async function searchTalents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    try {
        const snapshot = await db.collection('talents').get();
        const talents = [];
        
        snapshot.forEach(doc => {
            const talent = doc.data();
            if (talent.name.toLowerCase().includes(searchTerm) || 
                talent.id.includes(searchTerm)) {
                talents.push({ id: doc.id, ...talent });
            }
        });

        if (talents.length === 0) {
            resultsDiv.innerHTML = '<p>No results found</p>';
            return;
        }

        talents.forEach(talent => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <h3>${talent.name}</h3>
                <p>ID: ${talent.id}</p>
                <p>Phone: ${talent.phone}</p>
                <p>Email: ${talent.email}</p>
                <p>Visit Date: ${talent.visitDate}</p>
                <p>Status: ${talent.status}</p>
                <p>Pending Steps: ${talent.pendingSteps}</p>
            `;
            resultsDiv.appendChild(card);
        });
    } catch (error) {
        console.error("Error searching talents: ", error);
        resultsDiv.innerHTML = '<p>Error searching talents</p>';
    }
}

// Delete talent
async function deleteTalent(id) {
    if (confirm('Are you sure you want to delete this talent?')) {
        try {
            await db.collection('talents').doc(id).delete();
            updateDataframe();
        } catch (error) {
            console.error("Error deleting talent: ", error);
            alert('Error deleting talent');
        }
    }
}

// Load initial data
document.addEventListener('DOMContentLoaded', function() {
    showForm(); // Show form by default
});
