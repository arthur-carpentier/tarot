import { describe, it, expect } from "vitest";
import { computeTodayStats } from "../src/services/todayStats.js";

// Construit une manche minimale ; `scores` détermine qui a joué.
function game(numero, { preneur, appele, defenseurs, annonce = "Garde", fait, scores, cumuls }) {
    return {
        numero,
        preneur,
        appele,
        defenseurs,
        annonce,
        fait,
        prisChuteDe: fait ? 10 : -10,
        scores,
        cumulativeScores: cumuls,
    };
}

const PLAYERS = ["A", "B", "C", "D"];

// 5 manches : 2 d'avant la journée (n°1-2), 3 du jour (n°3-5).
// Le marqueur firstGameToday vaut 2 (dernière manche d'avant aujourd'hui).
function buildGames() {
    const games = [];
    const cumuls = { A: 0, B: 0, C: 0, D: 0 };
    const play = (numero, preneur, appele, fait, scores) => {
        for (const name of Object.keys(scores)) cumuls[name] += scores[name];
        games.push(
            game(numero, {
                preneur,
                appele,
                defenseurs: PLAYERS.filter((p) => p !== preneur && p !== appele),
                annonce: fait ? "Garde" : "Petite",
                fait,
                scores: { ...scores },
                cumuls: { ...cumuls },
            })
        );
    };
    // Avant la journée : A et B prennent de l'avance.
    play(1, "A", "B", true, { A: 30, B: 15, C: -22.5, D: -22.5 });
    play(2, "A", "B", true, { A: 30, B: 15, C: -22.5, D: -22.5 });
    // Aujourd'hui : C remonte fort.
    play(3, "C", "D", true, { C: 40, D: 20, A: -30, B: -30 });
    play(4, "C", "A", true, { C: 40, A: 20, B: -30, D: -30 });
    play(5, "A", "B", false, { A: -30, B: -30, C: 40, D: 20 });
    return games;
}

describe("computeTodayStats", () => {
    const games = buildGames();
    const result = computeTodayStats(games, PLAYERS, 2);
    const get = (name) => result.ranking.find((e) => e.name === name);

    it("ne retient que les manches du jour", () => {
        expect(result.todayGames.map((g) => g.numero)).toEqual([3, 4, 5]);
        expect(result.startNumero).toBe(3);
        expect(result.baselineGame.numero).toBe(2);
    });

    it("points gagnés/perdus sur la journée", () => {
        expect(get("C").pointsToday).toBe(120); // 40 + 40 + 40
        expect(get("A").pointsToday).toBe(-40); // -30 + 20 - 30
        expect(get("B").pointsToday).toBe(-90); // -30 - 30 - 30
        expect(get("D").pointsToday).toBe(10); // 20 - 30 + 20
    });

    it("victoires et défaites du jour", () => {
        expect(get("C").victoiresToday).toBe(3);
        expect(get("C").defaitesToday).toBe(0);
        expect(get("A").victoiresToday).toBe(1); // seulement n°4
        expect(get("A").defaitesToday).toBe(2);
    });

    it("classement trié par points du jour décroissant", () => {
        expect(result.ranking[0].name).toBe("C");
        const pts = result.ranking.map((e) => e.pointsToday);
        expect([...pts].sort((x, y) => y - x)).toEqual(pts);
        expect(result.leader.name).toBe("C");
    });

    it("places gagnées depuis le début de la journée", () => {
        // Avant la journée : A=90, B=45, C=-45, D=-45 -> A 1er, C/D derniers.
        // C marque +120 et grimpe : il gagne des places.
        expect(get("C").rankDelta).toBeGreaterThan(0);
        expect(get("A").rankDelta).toBeLessThan(0);
    });

    it("récapitule les annonces prises comme preneur", () => {
        // C est preneur en n°3 et n°4 (Garde, réussies)
        const c = get("C");
        expect(c.annonces).toHaveLength(2);
        expect(c.annonces.every((a) => a.fait)).toBe(true);
        // A preneur en n°5 (Petite chutée)
        const a = get("A");
        expect(a.annonces).toEqual([
            expect.objectContaining({ name: "Petite", fait: false, numero: 5 }),
        ]);
    });

    it("temps forts du jour : plus gros gain et plus grosse perte sur une manche", () => {
        expect(result.records.topGain.score).toBe(40);
        expect(result.records.topLoss.score).toBe(-30);
    });

    it("répartition attaque / défense du jour", () => {
        expect(result.attaqueWins).toBe(2); // n°3 et n°4 faites
        expect(result.defenseWins).toBe(1); // n°5 chutée
    });

    it("série de victoires du jour", () => {
        expect(get("C").bestWinStreak).toBe(3);
        expect(result.hotStreak.name).toBe("C");
    });
});

describe("computeTodayStats — cas limites", () => {
    it("renvoie un résultat vide sans marqueur de journée", () => {
        const result = computeTodayStats(buildGames(), PLAYERS, null);
        expect(result.todayGames).toEqual([]);
        expect(result.ranking).toEqual([]);
        expect(result.leader).toBeNull();
    });

    it("renvoie un résultat vide si aucune manche après le marqueur", () => {
        const games = buildGames();
        const result = computeTodayStats(games, PLAYERS, 5); // 5 = dernière manche
        expect(result.todayGames).toEqual([]);
    });

    it("gère l'absence totale de parties", () => {
        const result = computeTodayStats([], PLAYERS, 2);
        expect(result.todayGames).toEqual([]);
    });
});
