// Réplique des formules de calcul de la feuille "Parties" pour la
// prévisualisation des points avant l'ajout d'une manche.

export const POINTS_A_FAIRE = { 0: 56, 1: 51, 2: 41, 3: 36 };

export function computeRound({
    annonce, // { name, score, multiplicateur } (feuille "Données")
    pointsTour,
    nbBouts,
    pour, // "Attaque" ou "Défense"
    bonusPoints, // somme des points des bonus cochés (colonne W)
}) {
    const boutsAttaque = pour === "Attaque" ? Math.max(nbBouts, 0) : 3 - nbBouts;
    const pointsAttaque = pour === "Attaque" ? Math.max(pointsTour, 0) : 91 - pointsTour;
    const pointsAFaire = POINTS_A_FAIRE[boutsAttaque] ?? 56;
    const fait = pointsAttaque >= pointsAFaire;

    // Colonne Y : points perdus par chaque défenseur (avant répartition)
    const pointsPerdusDefenseur =
        (fait ? 1 : -1) *
        ((bonusPoints / 3 + Math.abs(pointsAttaque - pointsAFaire)) * annonce.multiplicateur +
            annonce.score);

    return { boutsAttaque, pointsAttaque, pointsAFaire, fait, pointsPerdusDefenseur };
}

// Répartition des points (colonnes AE..AQ) : preneur ×2, appelé ×1,
// défenseurs −3/n chacun. Si le preneur s'appelle lui-même il cumule ×3.
export function distributePoints({ preneur, appele, defenseurs, pointsPerdusDefenseur }) {
    const share = {};
    const add = (name, value) => {
        share[name] = (share[name] || 0) + value;
    };
    add(preneur, pointsPerdusDefenseur * 2);
    if (appele) add(appele, pointsPerdusDefenseur);
    defenseurs.forEach((name) =>
        add(name, (-3 * pointsPerdusDefenseur) / defenseurs.length)
    );
    return share;
}
