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
    document.getElementById('dataframeSection').style.display = 'none';
}

function showDataframe() {
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('dataframeSection').style.display = 'block';
    updateDataframe();
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
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting talent: ' + error.message);
        } finally {
            hideLoading();
        }
    }
}

// Initial load - Wrap everything in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Verify connection
    db.collection('talents').get()
        .then(() => console.log('Connected to Firestore'))
        .catch(error => {
            console.error('Connection error:', error);
            alert('Error connecting to database: ' + error.message);
        });

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
});
