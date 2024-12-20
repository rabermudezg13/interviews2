// Verificar conexión a Firestore
db.collection('talents').get()
    .then(() => console.log('Conexión a Firestore exitosa'))
    .catch(error => console.error('Error de conexión:', error));

// Funciones de navegación
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

// Manejar el formulario
document.getElementById('talentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
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
        console.log('Talent saved successfully');
        alert('Talent added successfully');
        this.reset();
        showDataframe();
    } catch (error) {
        console.error('Error saving talent:', error);
        alert('Error saving talent: ' + error.message);
    }
});

// Actualizar tabla
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
        console.error('Error loading talents:', error);
        alert('Error loading talents: ' + error.message);
    }
}

// Eliminar talento
async function deleteTalent(id) {
    if (confirm('Are you sure you want to delete this talent?')) {
        try {
            await db.collection('talents').doc(id).delete();
            console.log('Talent deleted successfully');
            updateDataframe();
        } catch (error) {
            console.error('Error deleting talent:', error);
            alert('Error deleting talent: ' + error.message);
        }
    }
}

// Cargar datos iniciales
document.addEventListener('DOMContentLoaded', function() {
    showForm();
});
