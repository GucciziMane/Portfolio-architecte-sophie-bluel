let works = [];
let categories = [];
const gallery = document.querySelector('.gallery');

async function init() {
  await afficherProjets();
  await afficherfiltres();
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

async function afficherProjets() {
  const reponse = await fetch('http://localhost:5678/api/works');
  works = await reponse.json();

  for (let i = 0; i < works.length; i++) {
    const work = works[i];
    ajouterProjet(work);
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
  gallery.innerHTML = '';
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

init();