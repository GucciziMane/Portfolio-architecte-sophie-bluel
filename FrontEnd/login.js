// --- récupération du formulaire de connexion ---
const form = document.querySelector('form');

// --- écoute de l'événement de soumission du formulaire ---
form.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    
    const reponse = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    });

    const data = await reponse.json();

    if (reponse.ok) {
    localStorage.setItem('token', data.token);
    window.location.href = 'index.html';
    } 
    else {
    alert('Erreur dans l\'identifiant ou le mot de passe');
}
    
});