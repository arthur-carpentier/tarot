import { describe, it, expect } from "vitest";
import { computeRound, distributePoints } from "../src/services/scoring.js";

// Cas réels vérifiés contre les colonnes calculées de la feuille "Parties"
const GARDE_SANS = { name: "Garde sans", score: 80, multiplicateur: 4 };
const GARDE = { name: "Garde", score: 40, multiplicateur: 2 };

describe("computeRound", () => {
    it("réplique la partie n°1 (Garde sans chutée, points comptés défense)", () => {
        // Arthur prend, 63.5 pts et 2 bouts pour la défense, petit au bout (30)
        const round = computeRound({
            annonce: GARDE_SANS,
            pointsTour: 63.5,
            nbBouts: 2,
            pour: "Défense",
            bonusPoints: 30,
        });
        expect(round.boutsAttaque).toBe(1);
        expect(round.pointsAttaque).toBe(27.5);
        expect(round.pointsAFaire).toBe(51);
        expect(round.fait).toBe(false);
        // Colonne Y de la feuille : -214
        expect(round.pointsPerdusDefenseur).toBeCloseTo(-214, 5);
    });

    it("réplique la partie n°2 (Garde faite, points comptés attaque)", () => {
        const round = computeRound({
            annonce: GARDE,
            pointsTour: 40.5,
            nbBouts: 3,
            pour: "Attaque",
            bonusPoints: 0,
        });
        expect(round.boutsAttaque).toBe(3);
        expect(round.pointsAFaire).toBe(36);
        expect(round.fait).toBe(true);
        // (0/3 + |40.5-36|) * 2 + 40 = 49
        expect(round.pointsPerdusDefenseur).toBeCloseTo(49, 5);
    });

    it("objectifs de points selon les bouts de l'attaque", () => {
        for (const [bouts, objectif] of [
            [0, 56],
            [1, 51],
            [2, 41],
            [3, 36],
        ]) {
            const round = computeRound({
                annonce: GARDE,
                pointsTour: 45,
                nbBouts: bouts,
                pour: "Attaque",
                bonusPoints: 0,
            });
            expect(round.pointsAFaire).toBe(objectif);
        }
    });
});

describe("distributePoints", () => {
    it("preneur ×2, appelé ×1, défenseurs -3/n : somme nulle", () => {
        const share = distributePoints({
            preneur: "Arthur",
            appele: "Cindy",
            defenseurs: ["Elie", "Tom", "Peïo"],
            pointsPerdusDefenseur: -214,
        });
        // Valeurs de la partie n°1 de la feuille (colonnes AE..AK)
        expect(share.Arthur).toBeCloseTo(-428, 5);
        expect(share.Cindy).toBeCloseTo(-214, 5);
        expect(share.Elie).toBeCloseTo(214, 5);
        expect(share.Tom).toBeCloseTo(214, 5);
        expect(share["Peïo"]).toBeCloseTo(214, 5);
        const total = Object.values(share).reduce((a, b) => a + b, 0);
        expect(total).toBeCloseTo(0, 5);
    });

    it("auto-appel : le preneur cumule ×3", () => {
        const share = distributePoints({
            preneur: "Elie",
            appele: "Elie",
            defenseurs: ["Tom", "Cindy", "Arthur"],
            pointsPerdusDefenseur: 50,
        });
        expect(share.Elie).toBeCloseTo(150, 5);
        expect(share.Tom).toBeCloseTo(-50, 5);
        const total = Object.values(share).reduce((a, b) => a + b, 0);
        expect(total).toBeCloseTo(0, 5);
    });

    it("4 défenseurs : chacun perd 3Y/4", () => {
        const share = distributePoints({
            preneur: "A",
            appele: "B",
            defenseurs: ["C", "D", "E", "F"],
            pointsPerdusDefenseur: 100,
        });
        expect(share.C).toBeCloseTo(-75, 5);
        const total = Object.values(share).reduce((a, b) => a + b, 0);
        expect(total).toBeCloseTo(0, 5);
    });
});
