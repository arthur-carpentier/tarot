// Statistiques centrées sur les parties du jour.
//
// La "journée" commence juste après la manche marquée comme dernière d'avant
// aujourd'hui (Graphiques!R3, exposée par le store sous `firstGameToday` ;
// elle est écrite par le script quand on coche « première partie de la
// journée »). On en déduit la liste des manches du jour, un classement
// annoté (places et points gagnés/perdus depuis le début de la journée),
// les temps forts et la répartition attaque/défense.

const blank = () => ({
    todayGames: [],
    baselineGame: null,
    startNumero: null,
    ranking: [],
    records: { topGain: null, topLoss: null },
    attaqueWins: 0,
    defenseWins: 0,
    leader: null,
    hotStreak: null,
});

// Rang global (saison) à un instant donné parmi les joueurs ayant déjà
// participé, d'après le cumul de la manche. Renvoie une Map name -> rang
// (1 = meilleur). `null` => avant toute partie (égalité à zéro).
function rankAt(game, players) {
    if (!game) return new Map(players.map((name, i) => [name, i + 1]));
    return new Map(
        players
            .map((name) => ({ name, score: game.cumulativeScores[name] ?? 0 }))
            .sort((a, b) => b.score - a.score)
            .map((entry, i) => [entry.name, i + 1])
    );
}

export function computeTodayStats(games, players, firstGameToday) {
    if (!games.length) return blank();

    // Indice de la première manche du jour : R3 contient la dernière manche
    // d'AVANT la journée, le jour commence donc strictement après.
    const startIndex = firstGameToday
        ? games.findIndex((g) => g.numero > firstGameToday)
        : -1;
    if (startIndex < 0) return blank();

    const todayGames = games.slice(startIndex);
    if (!todayGames.length) return blank();

    const baselineGame = startIndex > 0 ? games[startIndex - 1] : null;
    const lastGame = games[games.length - 1];

    const rankNow = rankAt(lastGame, players);
    const rankBefore = rankAt(baselineGame, players);

    // Agrégat par joueur sur les seules manches du jour.
    const stats = new Map();
    const ensure = (name) => {
        let s = stats.get(name);
        if (!s) {
            s = {
                name,
                pointsToday: 0,
                participationsToday: 0,
                victoiresToday: 0,
                defaitesToday: 0,
                annonces: [], // contrats pris comme preneur aujourd'hui
                bestHand: null, // meilleure manche du jour { score, numero, annonce }
                worstHand: null,
                _streak: { sign: 0, length: 0 }, // série en cours sur la journée
                bestWinStreak: 0, // plus longue série de victoires du jour
            };
            stats.set(name, s);
        }
        return s;
    };

    let topGain = null;
    let topLoss = null;
    let attaqueWins = 0;

    for (const game of todayGames) {
        if (game.fait) attaqueWins++;

        for (const [name, score] of Object.entries(game.scores)) {
            const s = ensure(name);
            s.participationsToday++;
            s.pointsToday += score;

            const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
            if (sign > 0) s.victoiresToday++;
            else if (sign < 0) s.defaitesToday++;

            // Série de victoires consécutives sur la journée
            if (sign !== 0 && s._streak.sign === sign) s._streak.length++;
            else s._streak = { sign, length: sign === 0 ? 0 : 1 };
            if (s._streak.sign > 0) s.bestWinStreak = Math.max(s.bestWinStreak, s._streak.length);

            if (!s.bestHand || score > s.bestHand.score)
                s.bestHand = { score, numero: game.numero, annonce: game.annonce };
            if (!s.worstHand || score < s.worstHand.score)
                s.worstHand = { score, numero: game.numero, annonce: game.annonce };

            const record = { player: name, score, numero: game.numero, annonce: game.annonce };
            if (!topGain || score > topGain.score) topGain = record;
            if (!topLoss || score < topLoss.score) topLoss = record;
        }

        // L'annonce est portée par le preneur de la manche.
        ensure(game.preneur).annonces.push({
            name: game.annonce,
            fait: game.fait,
            prisChuteDe: game.prisChuteDe,
            numero: game.numero,
        });
    }

    const ranking = [...stats.values()]
        .map((s) => {
            const before = rankBefore.get(s.name) ?? null;
            const now = rankNow.get(s.name) ?? null;
            const { _streak, ...rest } = s;
            return {
                ...rest,
                score: lastGame.cumulativeScores[s.name] ?? 0,
                rankNow: now,
                rankBefore: before,
                // positif => a gagné des places depuis le début de la journée
                rankDelta: before != null && now != null ? before - now : 0,
                currentStreak: _streak.sign > 0 ? _streak.length : 0,
            };
        })
        // La "course du jour" : tri par points gagnés sur la journée.
        .sort((a, b) => b.pointsToday - a.pointsToday || b.score - a.score);

    // Main la plus chaude : plus longue série de victoires d'affilée du jour.
    const hotStreak = ranking
        .filter((e) => e.bestWinStreak >= 2)
        .sort((a, b) => b.bestWinStreak - a.bestWinStreak)[0] || null;

    return {
        todayGames,
        baselineGame,
        startNumero: todayGames[0].numero,
        ranking,
        records: { topGain, topLoss },
        attaqueWins,
        defenseWins: todayGames.length - attaqueWins,
        leader: ranking[0] ?? null,
        hotStreak,
    };
}
