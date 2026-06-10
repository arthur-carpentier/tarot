/**
 * Web App Google Apps Script permettant à l'application (GitHub Pages)
 * d'ajouter des parties dans l'onglet "Parties" du Google Sheet.
 *
 * Le script écrit uniquement les colonnes de saisie (B à K et Q à V) sur la
 * première ligne libre : toutes les autres colonnes sont des formules déjà
 * remplies dans la feuille, les scores se recalculent donc automatiquement.
 *
 * Déploiement : voir apps-script/README.md
 */

var SHEET_NAME = "Parties";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    validate_(data);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Onglet "' + SHEET_NAME + '" introuvable');

    // Première ligne dont le Preneur (colonne B) est vide
    var preneurs = sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1).getValues();
    var row = -1;
    for (var i = 0; i < preneurs.length; i++) {
      if (preneurs[i][0] === "" || preneurs[i][0] === null) {
        row = i + 2;
        break;
      }
    }
    if (row === -1) throw new Error('Aucune ligne libre dans l\'onglet "' + SHEET_NAME + '"');

    var defenseurs = data.defenseurs || [];

    // Colonnes B..K : joueurs, annonce, points, bouts, camp
    sheet.getRange(row, 2, 1, 10).setValues([[
      data.preneur,
      data.appele || "",
      defenseurs[0] || "",
      defenseurs[1] || "",
      defenseurs[2] || "",
      defenseurs[3] || "",
      data.annonce,
      data.pointsTour,
      data.nbBouts,
      data.pour,
    ]]);

    // Colonnes Q..V : bonus
    sheet.getRange(row, 17, 1, 6).setValues([[
      Boolean(data.petitAuBout),
      Boolean(data.misereTetes),
      Boolean(data.misereAtouts),
      Boolean(data.simplePoignee),
      Boolean(data.doublePoignee),
      Boolean(data.triplePoignee),
    ]]);

    SpreadsheetApp.flush();
    var numero = sheet.getRange(row, 1).getValue();
    return json_({ ok: true, row: row, numero: numero });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

// Permet de tester que le déploiement répond (ouvrir l'URL dans un navigateur).
function doGet() {
  return json_({ ok: true, app: "tarot", sheet: SHEET_NAME });
}

function validate_(data) {
  if (!data.preneur) throw new Error("Preneur manquant");
  if (!data.annonce) throw new Error("Annonce manquante");
  if (data.pour !== "Attaque" && data.pour !== "Défense") {
    throw new Error('Le champ "pour" doit valoir "Attaque" ou "Défense"');
  }
  var points = Number(data.pointsTour);
  if (isNaN(points) || points < 0 || points > 91) {
    throw new Error("Points invalides (0 à 91 attendu)");
  }
  var bouts = Number(data.nbBouts);
  if (isNaN(bouts) || bouts < 0 || bouts > 3) {
    throw new Error("Nombre de bouts invalide (0 à 3 attendu)");
  }
  var defenseurs = data.defenseurs || [];
  if (defenseurs.length < 3 || defenseurs.length > 4) {
    throw new Error("Il faut 3 ou 4 défenseurs");
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
