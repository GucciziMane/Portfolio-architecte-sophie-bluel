let works = [];
let categories = [];
const gallery = document.querySelector('.gallery');

async function init() {
  await chargerProjets();
  afficherProjets();
  await afficherfiltres();
}

async function chargerProjets() {
  const reponse = await fetch('http://localhost:5678/api/works');
  works = await reponse.json();
}

function ajouterProjet(work) {
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  const figcaption = document.createElement('figcaption');

  img.src = work.imageUrl;
  img.alt = work.title;
  figcaption.textContent = work.title;

  figure.appendChild(img);
  figure.appendChild(figcaption);
  gallery.appendChild(figure);
}

function afficherProjets() {
  gallery.innerHTML = '';

  for (let i = 0; i < works.length; i++) {
    ajouterProjet(works[i]);
  }
}

async function afficherfiltres() {
  const reponse = await fetch('http://localhost:5678/api/categories');
  categories = await reponse.json();

  const categoriesContainer = document.querySelector('.filtres');

  const buttonTous = document.querySelector('[data-categorie="tous"]');  
  buttonTous.classList.add('active');
  buttonTous.addEventListener('click', () => {
  document.querySelectorAll('.filtres button').forEach(btn => btn.classList.remove('active'));
  buttonTous.classList.add('active');
  afficherProjets(); 
  });

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];

    const button = document.createElement('button');
    button.textContent = category.name;
    button.dataset.categoryId = category.id;

    button.addEventListener('click', () => {
    document.querySelectorAll('.filtres button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    filtrerProjets(category.id);
  });

    categoriesContainer.appendChild(button);
  }
}

function filtrerProjets(categoryId) {
  gallery.innerHTML = '';

  for ( let i = 0 ; i < works.length; i++) {
    if (works[i].categoryId === categoryId) {
      ajouterProjet(works[i]);
    }
  }
}

const token = localStorage.getItem('token');

function afficherModaleGalerie() {
  const modaleGalerie = document.querySelector('.modale-galerie');
  modaleGalerie.innerHTML = '';

  for (let i = 0; i < works.length; i++) {
    const work = works[i];

    const figure = document.createElement('figure');
    const img = document.createElement('img');
    const btnSupprimer = document.createElement('div');
    btnSupprimer.classList.add('btn-suppr');

    img.src = work.imageUrl;
    img.alt = work.title;
    btnSupprimer.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    btnSupprimer.addEventListener('click', () => supprimerProjet(work.id));

    figure.appendChild(img);
    figure.appendChild(btnSupprimer);
    modaleGalerie.appendChild(figure);
  }
}

async function supprimerProjet(id) {
  const response = await fetch(`http://localhost:5678/api/works/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.ok) {
    works = works.filter(work => work.id !== id);
    afficherProjets();
    afficherModaleGalerie();
  } else {
    alert('Erreur lors de la suppression');
  }
}

if (token) {
    const loginLi = document.querySelector('nav li a.login');
    loginLi.textContent = 'logout';
    loginLi.href = '#';

    const filtres = document.querySelector('.filtres');
    filtres.style.display = 'none';

    const bandeau = document.createElement('div');
    bandeau.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Mode édition';
    bandeau.id = 'bandeau-edition';
    document.documentElement.prepend(bandeau);

    const btnModifier = document.createElement('button');
    btnModifier.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';
    btnModifier.id = 'btn-modifier';

    const titrePortfolio = document.querySelector('#portfolio h2');
    titrePortfolio.style.display = 'flex';
    titrePortfolio.style.alignItems = 'center';
    titrePortfolio.style.justifyContent = 'center';
    titrePortfolio.style.gap = '20px';
    titrePortfolio.appendChild(btnModifier);

    function handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem('token');

        const bandeau = document.getElementById('bandeau-edition');
        if (bandeau) bandeau.remove();

        const btn = document.getElementById('btn-modifier');
        if (btn) btn.remove();

        filtres.style.display = '';

        loginLi.textContent = 'login';
        loginLi.href = 'login.html';
        loginLi.removeEventListener('click', handleLogout);

        modal.style.display = 'none';

        titrePortfolio.style.display = '';
        titrePortfolio.style.alignItems = '';
        titrePortfolio.style.justifyContent = '';
        titrePortfolio.style.gap = '';
    }

    loginLi.addEventListener('click', handleLogout);

    const modal = document.querySelector('#modale');
    const vueGalerie = document.getElementById('vue-galerie');
    const vueAjout = document.getElementById('vue-ajout');
    const btnAjouterPhoto = document.getElementById('btn-ajouter-photo');
    const btnRetour = document.querySelector('.btn-retour');
    const inputFile = document.getElementById('input-file');
    const previewImage = document.querySelector('.aperçu-image');
    const iconePlaceholder = document.querySelector('.icone-placeholder');
    const labelUpload = document.querySelector('.btn-upload');
    const infosFormat = document.querySelector('.infos-format');
    
    const formAjout = document.getElementById('form-ajout');
    const inputTitre = document.getElementById('titre');
    const selectCategorie = document.getElementById('categorie');
    const btnValiderForm = document.getElementById('btn-valider-form');

    btnModifier.addEventListener('click', () => {
        modal.style.display = 'block';
        vueGalerie.style.display = 'block';
        vueAjout.style.display = 'none';
        afficherModaleGalerie();
    });

    btnAjouterPhoto.addEventListener('click', () => {
        vueGalerie.style.display = 'none';
        vueAjout.style.display = 'block';

        const selectCategory = document.getElementById('categorie');
        selectCategory.innerHTML = '<option value=""></option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            selectCategory.appendChild(option);
        });
    });

    btnRetour.addEventListener('click', () => {
        vueAjout.style.display = 'none';
        vueGalerie.style.display = 'block';
        resetFormulaire();
    });

if (inputFile) {
    inputFile.addEventListener('change', () => {
        const file = inputFile.files[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert("Fichier trop volumineux (4Mo max)");
                inputFile.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const previewImg = document.querySelector('.preview-img') || document.querySelector('.aperçu-image');
                
                if (previewImg) {
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';
                    
                    document.querySelector('.icone-placeholder').style.display = 'none';
                    document.querySelector('.btn-upload').style.display = 'none';
                    document.querySelector('.infos-format').style.display = 'none';
                }
                
                verifierFormulaire(); 
            };
            reader.readAsDataURL(file);
        }
    });
}

    function verifierFormulaire() {
        const isImageLoaded = inputFile.files.length > 0;
        const isTitreFilled = inputTitre.value.trim() !== "";
        const isCategorieSelected = selectCategorie.value !== "";

        if (isImageLoaded && isTitreFilled && isCategorieSelected) {
            btnValiderForm.classList.add('active');
            btnValiderForm.disabled = false;
        } else {
            btnValiderForm.classList.remove('active');
            btnValiderForm.disabled = true;
        }
    }

    inputTitre.addEventListener('input', verifierFormulaire);
    selectCategorie.addEventListener('change', verifierFormulaire);

    formAjout.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('image', inputFile.files[0]);
        formData.append('title', inputTitre.value);
        formData.append('category', selectCategorie.value);

        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            const nouveauProjet = await response.json();
            works.push(nouveauProjet);
            afficherProjets();
            resetFormulaire();
            modal.style.display = 'none';
          }             
            else {
            alert('Erreur lors de l\'envoi');
        }
    });

    document.querySelectorAll('.btn-fermer').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            resetFormulaire();
        });
    });

    document.querySelector('.overlay').addEventListener('click', () => {
        modal.style.display = 'none';
        resetFormulaire();
    });
}

function resetFormulaire() {
    const form = document.getElementById('form-ajout');
    if (form) form.reset();
    const preview = document.querySelector('.preview-img');
    if (preview) {
        preview.src = '#';
        preview.style.display = 'none';
    }
    document.querySelectorAll('.icone-placeholder, .btn-upload, .infos-format').forEach(el => el.style.display = '');
    const btn = document.getElementById('btn-valider-form');
    if (btn) {
        btn.classList.remove('active');
        btn.disabled = true;
    }
}

init();