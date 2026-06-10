# Tarot

Application web de suivi des parties de tarot. Entièrement statique (Vue 3 +
Vite + Tailwind), hébergée sur **GitHub Pages**, avec le
[Google Sheet](https://docs.google.com/spreadsheets/d/1BRs8pRcSWjVSaukepufJvhKZOXczsXSur61r2X0nDK8/edit)
comme seule base de données.

## Fonctionnement

```
┌──────────────────┐   lecture (gviz JSON, public)   ┌────────────────┐
│  App GitHub Pages │ ───────────────────────────────▶│  Google Sheet  │
│  (Vue 3 statique) │                                  │   "Parties"    │
│                   │   écriture (POST)                │   "Données"    │
│                   │ ──────────▶ Apps Script ────────▶│                │
└──────────────────┘             (Web App)            └────────────────┘
```

- **Lecture** : l'application interroge directement la feuille via l'endpoint
  public `gviz` de Google Sheets (la feuille est accessible en lecture par
  lien). Aucun backend, aucune clé d'API.
- **Écriture** : l'ajout d'une partie passe par un petit script
  [Google Apps Script](apps-script/README.md) attaché à la feuille et déployé
  en Web App. Il écrit les colonnes de saisie (B–K, Q–V) sur la première ligne
  libre de l'onglet `Parties` ; les formules de la feuille calculent tout le
  reste (points, scores cumulés, classements).
- Les joueurs et barèmes (annonces, bonus, poignées) viennent de l'onglet
  `Données` ; ils se modifient directement dans la feuille.

## Pages

- **Parties** : liste des manches avec attaque/défense, annonce, bouts, points.
- **Nouvelle partie** : formulaire de saisie avec prévisualisation des points
  (mêmes formules que la feuille), enregistrement dans le Sheet.
- **Graphique** : évolution des scores cumulés par joueur.
- **Statistiques** : classement, stats par annonce, attaque vs défense.
- **Joueurs / Règles** : lecture seule depuis l'onglet `Données`.

## Développement

```bash
npm install
npm run dev      # serveur de dev (http://localhost:5173/tarot/)
npm run build    # build de production dans dist/
```

## Déploiement

1. **GitHub Pages** : dans *Settings → Pages*, choisir **GitHub Actions** comme
   source. Le workflow [`deploy.yml`](.github/workflows/deploy.yml) build et
   déploie automatiquement à chaque push sur `master`.
   L'application est servie sur `https://<user>.github.io/tarot/`
   (le `base` est configuré dans `vite.config.js`).
2. **Apps Script** : suivre [apps-script/README.md](apps-script/README.md) pour
   déployer le script d'écriture, puis coller son URL dans le panneau ⚙️ de la
   page « Nouvelle partie » (ou la renseigner en dur dans `src/config.js`).

## Structure

```
src/
├── config.js               # ID de la feuille, URL du script Apps Script
├── services/
│   ├── sheets.js           # lecture gviz + écriture via Apps Script
│   ├── scoring.js          # réplique des formules de score (prévisualisation)
│   └── avatars.js          # couleurs/initiales des joueurs
├── composables/
│   └── useTarotData.js     # store partagé (joueurs, règles, parties)
├── Components/             # layout, sidebar, avatars
└── Pages/                  # Parties, Nouvelle partie, Graphique, Stats…
apps-script/                # script d'écriture à déployer sur la feuille
```
