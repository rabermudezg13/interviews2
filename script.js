// Loading indicator functions
function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

// Navigation functions
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

// Search function
async function searchTalents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    showLoading();

    try {
        const snapshot = await db.collection('talents').get();
        const talents = [];
        
        snapshot.forEach(doc => {
            const talent = doc.data();
            if (talent.name.toLowerCase().includes(searchTerm) || 
                talent.id.toLowerCase().includes(searchTerm)) {
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
                <div class="card-actions">
                    <button onclick="editTalent('${talent.id}')" class="edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteTalent('${talent.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            resultsDiv.appendChild(card);
        });
    } catch (error) {
        console.error("Error searching talents:", error);
        resultsDiv.innerHTML = '<p>Error searching talents</p>';
    } finally {
        hideLoading();
    }
}

// Modal functions
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function editTalent(id) {
    showLoading();
    try {
        const doc = await db.collection('talents').doc(id).get();
        if (doc.exists) {
            const talent = doc.data();
            
            document.getElementById('editId').value = id;
            document.getElementById('editName').value = talent.name || '';
            document.getElementById('editIdNumber').value = talent.id || '';
            document.getElementById('editPhone').value = talent.phone || '';
            document.getElementById('editEmail').value = talent.email || '';
            document.getElementById('editVisitDate').value = talent.visitDate || '';
            document.getElementById('editStatus').value = talent.status || 'Pending';
            document.getElementById('editPendingSteps').value = talent.pendingSteps || '';
            
            document.getElementById('editModal').style.display = 'block';
        } else {
            alert('Talent not found');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading talent data');
    } finally {
        hideLoading();
    }
}

// Update dataframe
async function updateDataframe() {
    showLoading();
    try {
        const snapshot = await db.collection('talents').get();
        const tbody = document.getElementById('dataframeBody');
        tbody.innerHTML = '';

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="8">No data available</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const talent = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${talent.name || ''}</td>
                <td>${talent.id || ''}</td>
                <td>${talent.phone || ''}</td>
                <td>${talent.email || ''}</td>
                <td>${talent.visitDate || ''}</td>
                <td><span class="status-badge status-${(talent.status || '').toLowerCase().replace(' ', '-')}">${talent.status || ''}</span></td>
                <td>${talent.pendingSteps || ''}</td>
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
        console.error('Error:', error);
        alert('Error loading data: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Delete talent
async function deleteTalent(id) {
    if (confirm('Are you sure you want to delete this talent?')) {
        showLoading();
        try {
            await db.collection('talents').doc(id).delete();
            updateDataframe();
            // Si estamos en la vista de búsqueda, actualizar resultados
            if (document.getElementById('searchSection').style.display !== 'none') {
                searchTalents();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting talent: ' + error.message);
        } finally {
            hideLoading();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show initial form
    showForm();

    // Add form submission handler
    const talentForm = document.getElementById('talentForm');
    if (talentForm) {
        talentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            showLoading();
            
            try {
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
                
                await db.collection('talents').add(talent);
                alert('Talent added successfully');
                this.reset();
                showDataframe();
            } catch (error) {
                console.error('Error:', error);
                alert('Error saving talent: ' + error.message);
            } finally {
                hideLoading();
            }
        });
    }

    // Add edit form submission handler
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            showLoading();

            try {
                const id = document.getElementById('editId').value;
                const updatedTalent = {
                    name: document.getElementById('editName').value,
                    id: document.getElementById('editIdNumber').value,
                    phone: document.getElementById('editPhone').value,
                    email: document.getElementById('editEmail').value,
                    visitDate: document.getElementById('editVisitDate').value,
                    status: document.getElementById('editStatus').value,
                    pendingSteps: document.getElementById('editPendingSteps').value,
                    updatedAt: new Date().toISOString()
                };

                await db.collection('talents').doc(id).update(updatedTalent);
                closeModal();
                
                // Actualizar tanto la tabla como los resultados de búsqueda
                updateDataframe();
                if (document.getElementById('searchSection').style.display !== 'none') {
                    searchTalents();
                }
                
                alert('Talent updated successfully');
            } catch (error) {
                console.error('Error:', error);
                alert('Error updating talent: ' + error.message);
            } finally {
                hideLoading();
            }
        });
    }

    // Modal close handlers
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target == document.getElementById('editModal')) {
            closeModal();
        }
    });

    // Search input handler
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchTalents();
        }
    });
});
