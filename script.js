// Añadir al inicio del archivo
// Configurar Firebase
const firebaseConfig = {
    // Tus credenciales de Firebase aquí
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Modificar la función de guardar para usar Firebase
async function saveTalent(talent) {
    try {
        await db.collection('talents').add({
            ...talent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error saving talent: ", error);
        return false;
    }
}

// Función para cargar datos
async function loadTalents() {
    try {
        const snapshot = await db.collection('talents').get();
        const talents = [];
        snapshot.forEach(doc => {
            talents.push({ id: doc.id, ...doc.data() });
        });
        return talents;
    } catch (error) {
        console.error("Error loading talents: ", error);
        return [];
    }
}

// Función para aplicar filtros
function applyFilters() {
    const sortBy = document.getElementById('sortBy').value;
    let talents = JSON.parse(localStorage.getItem('talents') || '[]');
    
    switch(sortBy) {
        case 'date-desc':
            talents.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
            break;
        case 'date-asc':
            talents.sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
            break;
        case 'steps-desc':
            talents.sort((a, b) => b.pendingSteps.split(',').length - a.pendingSteps.split(',').length);
            break;
        case 'steps-asc':
            talents.sort((a, b) => a.pendingSteps.split(',').length - b.pendingSteps.split(',').length);
            break;
    }
    
    updateDataframe(talents);
    updateDailyStats(talents);
}

// Función para actualizar estadísticas diarias
function updateDailyStats(talents) {
    const dailyStats = talents.reduce((acc, talent) => {
        const date = talent.visitDate;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const statsDiv = document.getElementById('dailyStats');
    statsDiv.innerHTML = '';

    Object.entries(dailyStats)
        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
        .forEach(([date, count]) => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.innerHTML = `
                <div class="stat-date">${formatDate(date)}</div>
                <div class="stat-count">${count} interviews</div>
            `;
            statsDiv.appendChild(statCard);
        });
}

// Función para editar talento
function editTalent(id) {
    const talents = JSON.parse(localStorage.getItem('talents') || '[]');
    const talent = talents.find(t => t.id === id);
    
    if (talent) {
        document.getElementById('editId').value = id;
        document.getElementById('editSteps').value = talent.pendingSteps;
        document.getElementById('editStatus').value = talent.status;
        
        const modal = document.getElementById('editModal');
        modal.style.display = 'block';
    }
}

// Manejar el guardado de ediciones
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const newSteps = document.getElementById('editSteps').value;
    const newStatus = document.getElementById('editStatus').value;
    
    let talents = JSON.parse(localStorage.getItem('talents') || '[]');
    const index = talents.findIndex(t => t.id === id);
    
    if (index !== -1) {
        talents[index] = {
            ...talents[index],
            pendingSteps: newSteps,
            status: newStatus,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('talents', JSON.stringify(talents));
        document.getElementById('editModal').style.display = 'none';
        applyFilters();
    }
});
