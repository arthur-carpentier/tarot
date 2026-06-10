import { describe, it, expect } from "vitest";
import { computeSeasonStats, aggregatePlayers, MIN_PARTIES } from "../src/services/seasonStats.js";
import { computeDuoStats } from "../src/services/duoStats.js";

// Construit une manche minimale : `scores` détermine qui a joué.
function game(numero, { preneur, appele, defenseurs, annonce = "Garde", fait, scores, cumuls }) {
    return {
        numero,
        preneur,
        appele,
        defenseurs,
        annonce,
        fait,
        scores,
        cumulativeScores: cumuls,
    };
}

// Petit championnat synthétique : A et B jouent 16 manches (seuil MIN_PARTIES
// atteint), C n'en joue que 2 (exclu des titres en pourcentage).
function buildGames() {
    const games = [];
    const cumuls = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (let i = 1; i <= 16; i++) {
        // A preneur gagne les manches 1..10, perd 11..16
        const win = i <= 10;
        const y = 40;
        const scores = win
            ? { A: 2 * y, B: y, D: -y, E: -y, C: -y }
            : { A: -2 * y, B: -y, D: y, E: y, C: y };
        // C ne joue que les manches 1 et 2
        if (i > 2) {
            scores.C = undefined;
            delete scores.C;
        }
        const defenseurs = i > 2 ? ["D", "E"] : ["D", "E", "C"];
        for (const name of Object.keys(scores)) cumuls[name] += scores[name];
        games.push(
            game(i, {
                preneur: "A",
                appele: "B",
                defenseurs,
                fait: win,
                scores: { ...scores },
                cumuls: { ...cumuls },
            })
        );
    }
    return games;
}

const PLAYERS = ["A", "B", "C", "D", "E"];

describe("aggregatePlayers", () => {
    const stats = aggregatePlayers(buildGames(), PLAYERS);
    const get = (name) => stats.find((s) => s.name === name);

    it("compte les rôles et participations", () => {
        expect(get("A").parties).toBe(16);
        expect(get("A").preneur).toBe(16);
        expect(get("B").appele).toBe(16);
        expect(get("C").parties).toBe(2);
        expect(get("D").defense).toBe(16);
    });

    it("séries de victoires et de défaites avec leurs points", () => {
        const a = get("A");
        expect(a.serieVictoires.length).toBe(10);
        expect(a.serieVictoires.points).toBe(10 * 80);
        expect(a.serieDefaites.length).toBe(6);
        expect(a.serieDefaites.points).toBe(-6 * 80);
    });

    it("cumuls max/min atteints", () => {
        expect(get("A").cumulMax).toBe(800); // après 10 victoires à +80
        expect(get("A").cumulMin).toBe(0); // A ne passe jamais sous zéro
        expect(get("D").cumulMin).toBe(-400); // D au plus bas après 10 défaites à -40
    });

    it("gains et pertes en tant qu'appelé", () => {
        const b = get("B");
        expect(b.gainsRoi).toBe(10 * 40);
        expect(b.gainsRoi).toBe(b.gainsTotal); // B ne gagne qu'en tant qu'appelé
    });
});

describe("computeSeasonStats", () => {
    const games = buildGames();
    const { ranking, awards } = computeSeasonStats(games, PLAYERS, games[games.length - 1]);

    it("podium trié par score final", () => {
        expect(ranking[0].name).toBe("A"); // 800 - 960 = -160 ? Non : vérifie l'ordre réel
        // D et E finissent à -10*40 + 6*40 = -160 ; A à 2*(400-240) = ... le tri suffit :
        const scores = ranking.map((r) => r.score);
        expect([...scores].sort((x, y) => y - x)).toEqual(scores);
    });

    it("le seuil MIN_PARTIES exclut les joueurs peu présents des titres en %", () => {
        expect(MIN_PARTIES).toBe(15);
        // C a 100% de victoires en défense sur 1 manche gagnée mais ne doit
        // pas décrocher le titre
        expect(awards.meilleurDefenseur.player).not.toBe("C");
    });

    it("titres de présence et de volume", () => {
        expect(["A", "B", "D", "E"]).toContain(awards.toujoursPresent.player);
        expect(awards.toujoursPresent.value).toBe(16);
        expect(awards.serieVictoires.player).toBe("A");
        expect(awards.serieVictoires.value).toBe(10);
    });

    it("entretenu : part des gains réalisée comme appelé", () => {
        expect(awards.entretenu.player).toBe("B");
        expect(awards.entretenu.value).toBeCloseTo(100, 5);
    });
});

describe("computeDuoStats", () => {
    it("compte les duos preneur → appelé et leur réussite", () => {
        const games = buildGames();
        const duos = computeDuoStats(games);
        expect(duos.frequent[0]).toMatchObject({ preneur: "A", appele: "B", count: 16, wins: 10 });
        expect(duos.best[0].preneur).toBe("A");
        expect(duos.selfCalls).toBe(0);
    });
});
