# Script d'écriture (Google Apps Script)

L'application lit le Google Sheet sans authentification (la feuille est
accessible en lecture par lien). En revanche, **l'ajout de parties** passe par
un petit script Apps Script attaché à la feuille et déployé en Web App : c'est
lui qui a le droit d'écrire.

## Déploiement (une seule fois, ~2 minutes)

1. Ouvrir le Google Sheet, puis **Extensions → Apps Script**.
2. Remplacer le contenu de `Code.gs` par celui de [`Code.gs`](./Code.gs) et
   enregistrer.
3. **Déployer → Nouveau déploiement** :
   - Type : **Application Web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
4. Autoriser le script quand Google le demande.
5. Copier l'**URL de l'application Web**
   (`https://script.google.com/macros/s/…/exec`).
6. Dans l'application, page **Nouvelle partie**, cliquer sur l'icône ⚙️ et
   coller cette URL (elle est mémorisée dans le navigateur).

   Pour éviter cette étape à chaque nouvel appareil, on peut aussi renseigner
   l'URL en dur dans `src/config.js` (`DEFAULT_APPS_SCRIPT_URL`) et redéployer.

## Mise à jour du script

Après modification du code dans l'éditeur Apps Script :
**Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version → Déployer**
(sinon l'URL continue de servir l'ancienne version).

## Notes techniques

- L'application envoie le JSON en `Content-Type: text/plain` pour éviter la
  requête preflight CORS, qu'Apps Script ne gère pas.
- Le script écrit uniquement les colonnes de saisie (B–K, Q–V et AA–AB) sur
  la première ligne libre de l'onglet `Parties`. Les formules (déjà remplies
  jusqu'à la ligne 1000) calculent le reste : scores, cumuls, classements.
- Un verrou (`LockService`) évite que deux ajouts simultanés écrivent sur la
  même ligne.
- Colonnes AA/AB : bonus "petit chelem" (+200) et "grand chelem" (+400).
  Elles sont bien enregistrées par le script, mais la formule de la colonne W
  (`POINTS_BONUS`) de la feuille doit être complétée à la main pour les
  prendre en compte dans le calcul des scores (voir le commentaire en tête de
  `Code.gs`).
