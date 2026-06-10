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
// Étapes du chargement initial, affichées par l'écran de démarrage
const loadingSteps = ref([]);

let loadedOnce = false;
const initialLoadDone = ref(false);

async function load() {
    loading.value = true;
    error.value = null;
    loadingSteps.value = [
        { label: "Connexion au Google Sheet", done: false },
        { label: "Joueurs et règles (onglet « Données »)", done: false },
        { label: "Parties et scores (onglet « Parties »)", done: false },
    ];
    try {
        const rulesPromise = fetchRules().then((rules) => {
            loadingSteps.value[0].done = true;
            loadingSteps.value[1].done = true;
            loadingSteps.value[1].label = `${rules.players.length} joueurs, ${rules.annonces.length} annonces`;
            return rules;
        });
        const gamesPromise = fetchGames().then((parties) => {
            loadingSteps.value[0].done = true;
            loadingSteps.value[2].done = true;
            loadingSteps.value[2].label = `${parties.games.length} parties chargées`;
            return parties;
        });
        const [rules, parties] = await Promise.all([rulesPromise, gamesPromise]);
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
        initialLoadDone.value = true;
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
        loadingSteps,
        initialLoadDone,
        lastGame,
        standings,
        refresh: load,
    };
}
