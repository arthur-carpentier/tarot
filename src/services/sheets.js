import { SHEET_ID, getAppsScriptUrl } from "@/config";

// Indices (base 0) des colonnes de la feuille "Parties".
// A-K et Q-V sont saisies, le reste est calculé par les formules de la feuille.
const COL = {
    NUMERO: 0, // A : n° manche
    PRENEUR: 1, // B
    APPELE: 2, // C
    DEFENSEUR_1: 3, // D..G
    ANNONCE: 7, // H
    POINTS_TOUR: 8, // I
    NB_BOUTS: 9, // J
    POUR: 10, // K : "Attaque" ou "Défense"
    BOUTS_ATTAQUE: 11, // L
    POINTS_ATTAQUE: 12, // M
    POINTS_DEFENSE: 13, // N
    POINTS_A_FAIRE: 14, // O
    FAIT: 15, // P : "OUI"/"NON"
    PETIT_AU_BOUT: 16, // Q..V : booléens bonus
    POINTS_BONUS: 22, // W
    MULTIPLICATEUR: 23, // X
    POINTS_PERDUS_DEFENSEUR: 24, // Y
    PRIS_CHUTE_DE: 25, // Z
    SCORES_START: 30, // AE..AQ : points de la manche par joueur (en-tête = nom)
    SCORES_END: 42,
    CUMUL_OFFSET: 26, // BE..BQ : score cumulé, aligné sur AE..AQ
};

async function fetchGviz(sheetName, range) {
    const url =
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
        `?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&range=${range}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Lecture de la feuille "${sheetName}" impossible (${response.status})`);
    }
    const text = await response.text();
    // La réponse est du JSON enveloppé dans google.visualization.Query.setResponse(...)
    const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
    if (json.status === "error") {
        throw new Error(json.errors?.[0]?.detailed_message || "Erreur Google Sheets");
    }
    return json.table;
}

const cellValue = (row, index) => row.c?.[index]?.v ?? null;

// Feuille "Données" : joueurs, annonces, poignées et bonus.
export async function fetchRules() {
    const table = await fetchGviz("Données", "A1:L30");
    let rows = table.rows || [];
    // Ignore la ligne d'en-tête si gviz ne l'a pas détectée (voir fetchGames)
    if (rows.length && String(cellValue(rows[0], 0)) === "Joueurs") {
        rows = rows.slice(1);
    }

    const players = [];
    const annonces = [];
    const poignees = [];
    const bonuses = [];

    rows.forEach((row, i) => {
        const player = cellValue(row, 0);
        if (player) players.push(String(player));

        const annonce = cellValue(row, 2);
        if (annonce) {
            annonces.push({
                name: String(annonce),
                score: Number(cellValue(row, 3)) || 0,
                // Petite ×1, Garde ×2, Garde sans ×4... comme la colonne X de "Parties"
                multiplicateur: 2 ** annonces.length,
            });
        }

        const poignee = cellValue(row, 5);
        if (poignee !== null) {
            poignees.push({
                atouts: Number(poignee),
                points: Number(cellValue(row, 6)) || 0,
            });
        }

        const bonus = cellValue(row, 10);
        if (bonus) {
            bonuses.push({
                name: String(bonus),
                points: Number(cellValue(row, 11)) || 0,
            });
        }
    });

    return { players, annonces, poignees, bonuses };
}

// Feuille "Parties" : manches saisies + scores calculés par joueur.
export async function fetchGames() {
    // Les noms de joueurs (en-tête des colonnes AE..AQ) sont récupérés à part :
    // sur la grande plage, gviz type ces colonnes en numérique et renvoie null
    // pour les cellules texte de la ligne 1.
    const [headerTable, table] = await Promise.all([
        fetchGviz("Parties", "AE1:AQ1"),
        fetchGviz("Parties", "A1:CC1000"),
    ]);

    const headerRow = headerTable.rows?.[0];
    const names = headerRow
        ? (headerRow.c || []).map((cell) => (cell?.v != null ? String(cell.v) : ""))
        : (headerTable.cols || []).map((col) => col?.label || "");
    const playerColumns = [];
    names.forEach((name, j) => {
        if (!name) return;
        const scoreIndex = COL.SCORES_START + j;
        playerColumns.push({ name, scoreIndex, cumulIndex: scoreIndex + COL.CUMUL_OFFSET });
    });

    // Ignore la ligne d'en-tête si gviz l'a renvoyée comme donnée
    let rows = table.rows || [];
    if (rows.length && String(cellValue(rows[0], COL.PRENEUR)) === "Preneur") {
        rows = rows.slice(1);
    }

    const games = rows
        .filter((row) => cellValue(row, COL.PRENEUR))
        .map((row) => {
            const defenseurs = [];
            for (let i = COL.DEFENSEUR_1; i < COL.ANNONCE; i++) {
                const name = cellValue(row, i);
                if (name) defenseurs.push(String(name));
            }
            const scores = {};
            const cumulativeScores = {};
            playerColumns.forEach(({ name, scoreIndex, cumulIndex }) => {
                const score = cellValue(row, scoreIndex);
                if (score !== null) scores[name] = Number(score);
                const cumul = cellValue(row, cumulIndex);
                if (cumul !== null) cumulativeScores[name] = Number(cumul);
            });
            return {
                numero: Number(cellValue(row, COL.NUMERO)),
                preneur: String(cellValue(row, COL.PRENEUR)),
                appele: cellValue(row, COL.APPELE) ? String(cellValue(row, COL.APPELE)) : null,
                defenseurs,
                annonce: cellValue(row, COL.ANNONCE),
                pointsTour: Number(cellValue(row, COL.POINTS_TOUR)),
                nbBouts: Number(cellValue(row, COL.NB_BOUTS)),
                pour: cellValue(row, COL.POUR),
                boutsAttaque: Number(cellValue(row, COL.BOUTS_ATTAQUE)),
                pointsAttaque: Number(cellValue(row, COL.POINTS_ATTAQUE)),
                pointsDefense: Number(cellValue(row, COL.POINTS_DEFENSE)),
                pointsAFaire: Number(cellValue(row, COL.POINTS_A_FAIRE)),
                fait: cellValue(row, COL.FAIT) === "OUI",
                petitAuBout: cellValue(row, COL.PETIT_AU_BOUT) === true,
                misereTetes: cellValue(row, COL.PETIT_AU_BOUT + 1) === true,
                misereAtouts: cellValue(row, COL.PETIT_AU_BOUT + 2) === true,
                simplePoignee: cellValue(row, COL.PETIT_AU_BOUT + 3) === true,
                doublePoignee: cellValue(row, COL.PETIT_AU_BOUT + 4) === true,
                triplePoignee: cellValue(row, COL.PETIT_AU_BOUT + 5) === true,
                pointsBonus: Number(cellValue(row, COL.POINTS_BONUS)) || 0,
                multiplicateur: Number(cellValue(row, COL.MULTIPLICATEUR)) || 1,
                pointsPerdusDefenseur: Number(cellValue(row, COL.POINTS_PERDUS_DEFENSEUR)),
                prisChuteDe: Number(cellValue(row, COL.PRIS_CHUTE_DE)),
                scores,
                cumulativeScores,
            };
        });

    return { games, playerNames: playerColumns.map((c) => c.name) };
}

// Onglet "Statistiques pour carte résumée" : numéro et dates de la saison.
export async function fetchSeasonMeta() {
    try {
        const table = await fetchGviz("Statistiques pour carte résumée", "A2:C2");
        const row = table.rows?.[0];
        if (!row) return null;
        const parseDate = (value) => {
            // gviz renvoie les dates sous la forme "Date(2026,3,1)" (mois base 0)
            const match = /Date\((\d+),(\d+),(\d+)/.exec(String(value ?? ""));
            return match ? new Date(+match[1], +match[2], +match[3]) : null;
        };
        return {
            numero: Number(cellValue(row, 0)) || null,
            debut: parseDate(cellValue(row, 1)),
            fin: parseDate(cellValue(row, 2)),
        };
    } catch {
        return null;
    }
}

// Onglet "Graphiques" : R3 contient le n° de la première partie de la
// journée (écrit par le script quand on coche "première partie du jour").
export async function fetchTodayMarker() {
    try {
        const table = await fetchGviz("Graphiques", "R3");
        const value = Number(cellValue(table.rows?.[0], 0));
        return Number.isFinite(value) && value > 0 ? value : null;
    } catch {
        return null;
    }
}

// Appel du script Apps Script déployé en Web App.
// Le body est envoyé en text/plain pour éviter le preflight CORS
// (Apps Script ne répond pas aux requêtes OPTIONS).
async function callAppsScript(payload) {
    const url = getAppsScriptUrl();
    if (!url) {
        throw new Error(
            "L'URL du script Google Apps Script n'est pas configurée. " +
                "Renseignez-la dans le panneau de configuration de la page Nouvelle partie."
        );
    }
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(`Le script a répondu ${response.status}`);
    }
    const result = await response.json();
    if (!result.ok) {
        throw new Error(result.error || "Le script a refusé l'opération");
    }
    return result;
}

export function appendGame(game) {
    return callAppsScript({ action: "add", ...game });
}

export function deleteLastGame() {
    return callAppsScript({ action: "deleteLast" });
}
