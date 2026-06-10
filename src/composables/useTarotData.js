import { ref, computed } from "vue";
import { fetchRules, fetchGames } from "@/services/sheets";
import { registerPlayers } from "@/services/avatars";

// Store partagé entre les pages : la feuille n'est chargée qu'une fois,
// refresh() force un rechargement (après l'ajout d'une partie).
const players = ref([]);
const annonces = ref([]);
const poignees = ref([]);
const bonuses = ref([]);
const games = ref([]);
const loading = ref(false);
const error = ref(null);

let loadedOnce = false;

async function load() {
    loading.value = true;
    error.value = null;
    try {
        const [rules, parties] = await Promise.all([fetchRules(), fetchGames()]);
        players.value = rules.players;
        registerPlayers(rules.players);
        annonces.value = rules.annonces;
        poignees.value = rules.poignees;
        bonuses.value = rules.bonuses;
        games.value = parties.games;
        loadedOnce = true;
    } catch (e) {
        error.value = e.message || String(e);
    } finally {
        loading.value = false;
    }
}

export function useTarotData() {
    if (!loadedOnce && !loading.value) load();

    const lastGame = computed(() => games.value[games.value.length - 1] || null);

    // Score actuel de chaque joueur (cumul de la dernière manche jouée)
    const standings = computed(() => {
        const last = lastGame.value;
        return players.value
            .map((name) => {
                const played = games.value.filter(
                    (g) =>
                        g.preneur === name ||
                        g.appele === name ||
                        g.defenseurs.includes(name)
                );
                const wins = played.filter((g) => (g.scores[name] || 0) > 0).length;
                return {
                    name,
                    score: last ? last.cumulativeScores[name] ?? 0 : 0,
                    participations: played.length,
                    victoires: wins,
                };
            })
            .sort((a, b) => b.score - a.score);
    });

    return {
        players,
        annonces,
        poignees,
        bonuses,
        games,
        loading,
        error,
        lastGame,
        standings,
        refresh: load,
    };
}
