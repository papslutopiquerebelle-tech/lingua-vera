/* Lingua Vera — formulaire « Proposer un mot ou une phrase »
   Dans index.html : <div id="lv-proposer"></div> puis <script src="proposer.js"></script> */
(() => {
  const API = 'https://lingua-vera.papslutopiquerebelle.workers.dev';   // adresse du Worker
  const host = document.getElementById('lv-proposer');
  if (!host) return;

  // Langue activée par le visiteur dans le sélecteur Google Translate
  const langue = () => {
    const m = document.cookie.match(/googtrans=\/[^/]*\/([\w-]+)/);
    return m ? m[1] : (document.documentElement.lang || 'fr').slice(0, 5);
  };

  host.innerHTML = `
  <style>
    #lv-proposer{max-width:560px;margin:2rem auto;padding:1.2rem;border:1px solid #4a3a1c;border-radius:8px;background:#221b11;color:#efe3c6;font-family:Georgia,serif}
    #lv-proposer h2{margin:0 0 .6rem;font-weight:normal;color:#d4af5a}
    #lv-proposer input[type=text],#lv-proposer input[type=email]{width:100%;margin:.3rem 0 .8rem;padding:.6rem;background:#17130d;color:#efe3c6;border:1px solid #4a3a1c;border-radius:6px;font:inherit}
    #lv-proposer input:focus-visible,#lv-proposer button:focus-visible{outline:2px solid #d4af5a;outline-offset:2px}
    #lv-proposer label{display:block;font-size:.95rem}
    #lv-proposer .cg{display:flex;gap:.5rem;align-items:flex-start;font-size:.85rem;color:#a8987a;margin-bottom:.8rem}
    #lv-proposer button{padding:.6rem 1.2rem;background:#d4af5a;color:#17130d;border:0;border-radius:6px;font:inherit;cursor:pointer}
    #lv-proposer button:disabled{opacity:.5}
    #lv-res{margin-top:1rem;min-height:1.4rem}
  </style>
  <h2>Proposer un mot ou une phrase</h2>
  <form id="lv-f">
    <label>Dans votre langue<input type="text" id="lv-t" maxlength="300" required></label>
    <label>Adresse e-mail (facultatif, pour recevoir le résultat)<input type="email" id="lv-e"></label>
    <div class="cg"><input type="checkbox" id="lv-c"><label for="lv-c">J'accepte que mon adresse serve uniquement à m'envoyer ce résultat, puis soit supprimée.</label></div>
    <button type="submit">Envoyer la proposition</button>
  </form>
  <div id="lv-res" role="status" aria-live="polite"></div>`;

  const res = host.querySelector('#lv-res'), btn = host.querySelector('button');
  host.querySelector('#lv-f').addEventListener('submit', async ev => {
    ev.preventDefault();
    btn.disabled = true; res.textContent = 'Vérification en cours…';
    try {
      const email = host.querySelector('#lv-e').value.trim();
      const r = await fetch(API + '/api/propose', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ texte: host.querySelector('#lv-t').value, email, consent: host.querySelector('#lv-c').checked && !!email, lang: langue() })
      });
      const d = await r.json();
      if (!r.ok) res.textContent = d.message || d.erreur || 'Envoi impossible.';
      else if (d.status === 'existant') res.textContent = 'Déjà dans le dictionnaire : ' + d.trouve.map(f => f.fr + ' → ' + (f.lingua || '(équivalent à venir)')).join(' ; ');
      else res.textContent = 'Proposition reçue : elle est en cours de vérification.' + (email && host.querySelector('#lv-c').checked ? ' Vous recevrez le résultat par e-mail.' : '');
      if (r.ok) host.querySelector('#lv-t').value = '';
    } catch { res.textContent = 'Connexion impossible. Réessayez dans un instant.'; }
    btn.disabled = false;
  });
})();
