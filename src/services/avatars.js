// Couleur stable par joueur (plus de photos en base : la feuille ne stocke
// que les noms), utilisée pour les avatars à initiales et le graphique.
// Les couleurs sont attribuées selon l'ordre des joueurs dans la feuille
// "Données" (enregistré par le store au chargement).
const PALETTE = [
    "#e6194b",
    "#3cb44b",
    "#ffe119",
    "#4363d8",
    "#f58231",
    "#911eb4",
    "#42d4f4",
    "#f032e6",
    "#bfef45",
    "#fabed4",
    "#469990",
    "#dcbeff",
    "#9a6324",
    "#aaffc3",
    "#800000",
    "#fffac8",
];

const playerOrder = new Map();

export function registerPlayers(names) {
    names.forEach((name, i) => playerOrder.set(name, i));
}

export function playerColor(name) {
    let index = playerOrder.get(name);
    if (index === undefined) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
        }
        index = hash;
    }
    return PALETTE[index % PALETTE.length];
}

export function playerInitials(name) {
    return name
        .split(/[\s-]+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}
