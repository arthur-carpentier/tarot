// Stats sur les duos preneur → appelé (section "Stats sur les duos" de la
// feuille) : qui appelle qui, et avec quel taux de réussite.

// Nombre minimum de parties jouées ensemble pour les classements en %.
export const MIN_DUO_GAMES = 5;

export function computeDuoStats(games) {
    const duos = new Map();

    for (const game of games) {
        if (!game.appele || game.appele === game.preneur) continue;
        const key = `${game.preneur}→${game.appele}`;
        let duo = duos.get(key);
        if (!duo) {
            duo = { preneur: game.preneur, appele: game.appele, count: 0, wins: 0 };
            duos.set(key, duo);
        }
        duo.count++;
        if (game.fait) duo.wins++;
    }

    const all = [...duos.values()];
    const frequent = [...all].sort((a, b) => b.count - a.count).slice(0, 5);
    const eligible = all.filter((duo) => duo.count >= MIN_DUO_GAMES);
    const best = [...eligible]
        .sort((a, b) => b.wins / b.count - a.wins / a.count || b.count - a.count)
        .slice(0, 3);
    const worst = [...eligible]
        .sort((a, b) => a.wins / a.count - b.wins / b.count || b.count - a.count)
        .slice(0, 3);

    const selfCalls = games.filter((game) => game.appele === game.preneur).length;

    return { all, frequent, best, worst, selfCalls };
}
