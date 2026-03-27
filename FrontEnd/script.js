let works = [];
let categories = [];
const gallery = document.querySelector('.gallery');
const token = localStorage.getItem('token');

async function init() {
    await afficherProjets();
    await afficherfiltres();
    if (token) setupAdmin(); // On lance la partie Admin seulement si connecté
}

// --- CHARGEMENT DES DONNÉES ---

async function afficherProjets() {
    const reponse = await fetch('http://localhost:5678/api/works');
    works = await reponse.json();
    gallery.innerHTML = '';
    works.forEach(work => ajouterProjet(work));
}

function ajouterProjet(work) {
    const figure = document.createElement('figure');
    figure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
    `;
    gallery.appendChild(figure);
}

async function afficherfiltres() {
    const reponse = await fetch('http://localhost:5678/api/categories');
    categories = await reponse.json();
    const categoriesContainer = document.querySelector('.filtres');

    // Bouton "Tous"
    const buttonTous = document.querySelector('[data-categorie="tous"]');
    buttonTous.addEventListener('click', () => {
        refreshFiltres(buttonTous);
        afficherProjets();
    });

    // Boutons Catégories
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.addEventListener('click', () => {
            refreshFiltres(button);
            filtrerProjets(category.id);
        });
        categoriesContainer.appendChild(button);
    });
}

function refreshFiltres(activeBtn) {
    document.querySelectorAll('.filtres button').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function filtrerProjets(categoryId) {
    gallery.innerHTML = '';
    works.filter(w => w.categoryId === categoryId).forEach(ajouterProjet);
}

// --- PARTIE ADMINISTRATEUR (MODALE) ---

function setupAdmin() {
    // 1. Changements visuels sur la page
    document.querySelector('.filtres').style.display = 'none';
    document.querySelector('nav li a.login').textContent = 'logout';
    document.querySelector('nav li a.login').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.reload();
    });

    // Ajout du bandeau et du bouton modifier
    document.body.insertAdjacentHTML('afterbegin', `<div id="bandeau-edition"><i class="fa-regular fa-pen-to-square"></i> Mode édition</div>`);
    const btnModifier = document.createElement('button');
    btnModifier.id = 'btn-modifier';
    btnModifier.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';
    document.querySelector('#portfolio h2').appendChild(btnModifier);

    // 2. Gestion de la modale
    const modal = document.querySelector('#modale');
    const vueGalerie = document.getElementById('vue-galerie');
    const vueAjout = document.getElementById('vue-ajout');
    const inputFile = document.getElementById('input-file');
    const formAjout = document.getElementById('form-ajout');

    btnModifier.addEventListener('click', () => {
        modal.style.display = 'block';
        vueGalerie.style.display = 'block';
        vueAjout.style.display = 'none';
        afficherModaleGalerie();
    });

    document.getElementById('btn-ajouter-photo').addEventListener('click', () => {
        vueGalerie.style.display = 'none';
        vueAjout.style.display = 'block';
        remplirSelectCategories();
    });

    document.querySelector('.btn-retour').addEventListener('click', () => {
        vueAjout.style.display = 'none';
        vueGalerie.style.display = 'block';
        resetFormulaire();
    });

    // 3. Gestion de l'image (Preview)
    inputFile.addEventListener('change', () => {
        const file = inputFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.querySelector('.preview-img') || document.querySelector('.aperçu-image');
                preview.src = e.target.result;
                preview.style.display = 'block';
                document.querySelectorAll('.icone-placeholder, .btn-upload, .infos-format').forEach(el => el.style.display = 'none');
                verifierFormulaire();
            };
            reader.readAsDataURL(file);
        }
    });

    // 4. Envoi du formulaire
    formAjout.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formAjout);
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            const newWork = await response.json();
            works.push(newWork);
            ajouterProjet(newWork);
            modal.style.display = 'none';
            resetFormulaire();
        }
    });

    // Validation et Fermeture
    formAjout.addEventListener('input', verifierFormulaire);
    document.querySelectorAll('.btn-fermer, .overlay').forEach(btn => {
        btn.addEventListener('click', () => { modal.style.display = 'none'; resetFormulaire(); });
    });
}

// --- FONCTIONS SUPPORTS ---

function verifierFormulaire() {
    const btn = document.getElementById('btn-valider-form');
    const image = document.getElementById('input-file').files[0];
    const titre = document.getElementById('titre').value.trim();
    const cat = document.getElementById('categorie').value;

    const valide = image && titre && cat;
    btn.classList.toggle('active', !!valide);
    btn.disabled = !valide;
}

function resetFormulaire() {
    const form = document.getElementById('form-ajout');
    if (form) form.reset();
    const preview = document.querySelector('.preview-img') || document.querySelector('.aperçu-image');
    if (preview) preview.style.display = 'none';
    document.querySelectorAll('.icone-placeholder, .btn-upload, .infos-format').forEach(el => el.style.display = 'block');
}

function remplirSelectCategories() {
    const select = document.getElementById('categorie');
    select.innerHTML = '<option value=""></option>' + 
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function afficherModaleGalerie() {
    const container = document.querySelector('.modale-galerie');
    container.innerHTML = ''; // On vide pour éviter les doublons

    works.forEach(work => {
        const figure = document.createElement('figure');
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <span class="btn-suppr" data-id="${work.id}">
                <i class="fa-solid fa-trash-can"></i>
            </span>
        `;
        
        // Ajout de l'événement clic sur la poubelle
        figure.querySelector('.btn-suppr').addEventListener('click', () => {
            supprimerProjet(work.id);
        });

        container.appendChild(figure);
    });
}

async function supprimerProjet(id) {
    // 1. Appel API pour supprimer sur le serveur
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        // 2. Mettre à jour le tableau LOCAL (important pour que les filtres marchent encore)
        works = works.filter(work => work.id !== id);

        // 3. MISE À JOUR DE LA PAGE D'ACCUEIL
        // On vide la galerie principale
        gallery.innerHTML = ''; 
        // On la remplit avec le nouveau tableau 'works' qui n'a plus l'élément supprimé
        works.forEach(work => ajouterProjet(work));

        // 4. MISE À JOUR DE LA MODALE
        // On rappelle ta fonction pour que la photo disparaisse aussi de la modale
        afficherModaleGalerie();
        
    } else {
        alert("Erreur lors de la suppression");
    }
}

init();