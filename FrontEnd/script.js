async function afficherProjets() {
  const reponse = await fetch('http://localhost:5678/api/works');
  const works = await reponse.json();

  const gallery = document.querySelector('.gallery');

  for (let i = 0; i < works.length; i++) {
    const work = works[i];

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
}

afficherProjets();

async function afficherfiltres() {
  const reponse = await fetch('http://localhost:5678/api/categories');
  const categories = await reponse.json();

  const categoriesContainer = document.querySelector('.filtres');

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];

    const button = document.createElement('button');
    button.textContent = category.name;
    button.dataset.categoryId = category.id;

    categoriesContainer.appendChild(button);
  }
}

afficherfiltres();