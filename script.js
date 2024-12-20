// Función para guardar un nuevo talento
async function saveTalent(talent) {
    try {
        const docRef = await addDoc(collection(window.db, "talents"), {
            name: talent.name,
            id: talent.id,
            phone: talent.phone,
            email: talent.email,
            visitDate: talent.visitDate,
            status: talent.status,
            pendingSteps: talent.pendingSteps,
            createdAt: new Date().toISOString()
        });
        console.log("Talent saved with ID: ", docRef.id);
        return true;
    } catch (error) {
        console.error("Error saving talent: ", error);
        return false;
    }
}

// Función para cargar todos los talentos
async function loadTalents() {
    try {
        const querySnapshot = await getDocs(collection(window.db, "talents"));
        const talents = [];
        querySnapshot.forEach((doc) => {
            talents.push({ ...doc.data(), firebaseId: doc.id });
        });
        return talents;
    } catch (error) {
        console.error("Error loading talents: ", error);
        return [];
    }
}

// Función para actualizar un talento
async function updateTalent(firebaseId, updatedData) {
    try {
        const talentRef = doc(window.db, "talents", firebaseId);
        await updateDoc(talentRef, {
            ...updatedData,
            lastUpdated: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error("Error updating talent: ", error);
        return false;
    }
}

// Función para eliminar un talento
async function deleteTalent(firebaseId) {
    try {
        await deleteDoc(doc(window.db, "talents", firebaseId));
        return true;
    } catch (error) {
        console.error("Error deleting talent: ", error);
        return false;
    }
}

// Event Listener para el formulario
document.getElementById('talentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const talent = {
        name: document.getElementById('name').value,
        id: document.getElementById('id').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        visitDate: document.getElementById('visitDate').value,
        status: document.getElementById('status').value,
        pendingSteps: document.getElementById('pendingSteps').value
    };
    
    const saved = await saveTalent(talent);
    if (saved) {
        alert('Talent added successfully');
        this.reset();
        await updateDataframe();
    } else {
        alert('Error saving talent');
    }
});

// Función para actualizar el dataframe
async function updateDataframe() {
    const talents = await loadTalents();
    const tbody = document.getElementById('dataframeBody');
    tbody.innerHTML = '';

    talents.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))
          .forEach(talent => {
        const tr = document.createElement('tr');
        const statusClass = `status-${talent.status.toLowerCase().replace(' ', '-')}`;
        tr.innerHTML = `
            <td>${talent.name}</td>
            <td>${talent.id}</td>
            <td><a href="tel:${talent.phone}">${talent.phone}</a></td>
            <td><a href="mailto:${talent.email}">${talent.email}</a></td>
            <td>${formatDate(talent.visitDate)}</td>
            <td><span class="status-badge ${statusClass}">${talent.status}</span></td>
            <td>${talent.pendingSteps}</td>
            <td>
                <button onclick="editTalent('${talent.firebaseId}')" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="confirmDelete('${talent.firebaseId}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    updateDailyStats(talents);
}

// Función para confirmar eliminación
async function confirmDelete(firebaseId) {
    if (confirm('Are you sure you want to delete this talent?')) {
        const deleted = await deleteTalent(firebaseId);
        if (deleted) {
            await updateDataframe();
        } else {
            alert('Error deleting talent');
        }
    }
}

// Función para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', async function() {
    await updateDataframe();
});
