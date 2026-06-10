// Réplique des calculs des onglets "Statistiques pour carte résumée" et
// "Carte résumée" : podium de saison, records et titres décernés aux joueurs.

// Comme dans la feuille (Statistiques!F10) : nombre minimum de parties pour
// être pris en compte dans les titres en pourcentage.
export const MIN_PARTIES = 15;

export function aggregatePlayers(games, players) {
    const stats = new Map(
        players.map((name) => [
            name,
            {
                name,
                parties: 0,
                preneur: 0,
                appele: 0,
                defense: 0,
                attaque: 0,
                victoires: 0,
                defaites: 0,
                victoiresAttaque: 0,
                victoiresDefense: 0,
                gainsTotal: 0,
                pertesTotal: 0, // valeur positive (somme des |pertes|)
                gainsRoi: 0,
                pertesRoi: 0,
                plusGrosGain: null, // { score, numero, annonce }
                plusGrossePerte: null,
                serieVictoires: { length: 0, points: 0 },
                serieDefaites: { length: 0, points: 0 },
                cumulMax: 0,
                cumulMin: 0,
                _streak: { sign: 0, length: 0, points: 0 },
            },
        ])
    );

    for (const game of games) {
        for (const [name, stat] of stats) {
            const cumul = game.cumulativeScores[name];
            if (cumul !== undefined) {
                stat.cumulMax = Math.max(stat.cumulMax, cumul);
                stat.cumulMin = Math.min(stat.cumulMin, cumul);
            }

            const isPreneur = game.preneur === name;
            const isAppele = game.appele === name;
            const isDefense = game.defenseurs.includes(name);
            if (!isPreneur && !isAppele && !isDefense) continue;

            const score = game.scores[name] ?? 0;
            const win = score > 0;
            stat.parties++;
            if (isPreneur) stat.preneur++;
            // comme la feuille : l'auto-appel compte aussi comme "appelé"
            if (isAppele) stat.appele++;
            if (isDefense) stat.defense++;
            if (isPreneur || isAppele) stat.attaque++;
            if (win) {
                stat.victoires++;
                if (isPreneur || isAppele) stat.victoiresAttaque++;
                else stat.victoiresDefense++;
                stat.gainsTotal += score;
                if (isAppele && !isPreneur) stat.gainsRoi += score;
                if (!stat.plusGrosGain || score > stat.plusGrosGain.score) {
                    stat.plusGrosGain = { score, numero: game.numero, annonce: game.annonce };
                }
            } else {
                stat.defaites++;
                stat.pertesTotal += -score;
                if (isAppele && !isPreneur) stat.pertesRoi += -score;
                if (!stat.plusGrossePerte || score < stat.plusGrossePerte.score) {
                    stat.plusGrossePerte = { score, numero: game.numero, annonce: game.annonce };
                }
            }

            // Séries de victoires/défaites consécutives (sur les manches jouées)
            const sign = win ? 1 : -1;
            if (stat._streak.sign === sign) {
                stat._streak.length++;
                stat._streak.points += score;
            } else {
                stat._streak = { sign, length: 1, points: score };
            }
            const target = win ? stat.serieVictoires : stat.serieDefaites;
            if (stat._streak.length > target.length) {
                target.length = stat._streak.length;
                target.points = stat._streak.points;
            }
        }
    }

    for (const stat of stats.values()) delete stat._streak;
    return [...stats.values()].filter((stat) => stat.parties > 0);
}

// Sélectionne le joueur maximisant (ou minimisant) une valeur.
function pick(stats, getValue, { min = false, eligible = () => true } = {}) {
    let best = null;
    let bestValue = null;
    for (const stat of stats) {
        if (!eligible(stat)) continue;
        const value = getValue(stat);
        if (value === null || value === undefined || Number.isNaN(value)) continue;
        if (
            bestValue === null ||
            (min ? value < bestValue : value > bestValue)
        ) {
            best = stat;
            bestValue = value;
        }
    }
    return best ? { player: best.name, value: bestValue, stat: best } : null;
}

export function computeSeasonStats(games, players, lastGame) {
    const stats = aggregatePlayers(games, players);
    const hasMin = (s) => s.parties >= MIN_PARTIES;

    // Podium : classement par score cumulé final
    const ranking = stats
        .map((s) => ({ ...s, score: lastGame ? lastGame.cumulativeScores[s.name] ?? 0 : 0 }))
        .sort((a, b) => b.score - a.score);

    const pct = (num, den) => (den ? (num / den) * 100 : null);

    const awards = {
        toutTempsHaut: pick(stats, (s) => s.cumulMax),
        toutTempsBas: pick(stats, (s) => s.cumulMin, { min: true }),
        plusGrosGain: pick(stats, (s) => s.plusGrosGain?.score ?? null),
        plusGrossePerte: pick(stats, (s) => s.plusGrossePerte?.score ?? null, { min: true }),
        toujoursPresent: pick(stats, (s) => s.parties),
        victorieux: pick(stats, (s) => pct(s.victoires, s.parties), { eligible: hasMin }),
        plusPerdant: pick(stats, (s) => pct(s.victoires, s.parties), { min: true, eligible: hasMin }),
        gainsReguliers: pick(stats, (s) => s.victoires),
        pertesFrequentes: pick(stats, (s) => s.defaites),
        meilleurAttaquant: pick(stats, (s) => pct(s.victoiresAttaque, s.attaque), { eligible: hasMin }),
        pireAttaquant: pick(stats, (s) => pct(s.victoiresAttaque, s.attaque), { min: true, eligible: hasMin }),
        meilleurDefenseur: pick(stats, (s) => pct(s.victoiresDefense, s.defense), { eligible: hasMin }),
        pireDefenseur: pick(stats, (s) => pct(s.victoiresDefense, s.defense), { min: true, eligible: hasMin }),
        attaquantDansLAme: pick(stats, (s) => pct(s.attaque, s.parties), { eligible: hasMin }),
        defenseurDansLAme: pick(stats, (s) => pct(s.defense, s.parties), { eligible: hasMin }),
        preneurDansLAme: pick(stats, (s) => pct(s.preneur, s.attaque), { eligible: hasMin }),
        roiDansLAme: pick(stats, (s) => pct(s.appele, s.parties), { eligible: hasMin }),
        entretenu: pick(stats, (s) => pct(s.gainsRoi, s.gainsTotal), { eligible: hasMin }),
        sabote: pick(stats, (s) => pct(s.pertesRoi, s.pertesTotal), { eligible: hasMin }),
        gainsSolides: pick(stats, (s) => (s.victoires ? s.gainsTotal / s.victoires : null), {
            eligible: hasMin,
        }),
        pertesConsequentes: pick(
            stats,
            (s) => (s.defaites ? -s.pertesTotal / s.defaites : null),
            { min: true, eligible: hasMin }
        ),
        serieVictoires: pick(stats, (s) => s.serieVictoires.length),
        serieDefaites: pick(stats, (s) => s.serieDefaites.length),
    };

    return { ranking, awards, stats };
}
