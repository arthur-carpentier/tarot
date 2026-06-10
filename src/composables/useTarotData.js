import { ref, computed } from "vue";
import { fetchRules, fetchGames } from "@/services/sheets";
import { registerPlayers } from "@/services/avatars";

// Store partagé entre les pages : la feuille n'est chargée qu'une fois,
// refresh() force un rechargement (après l'ajout d'une partie).
// Un cache localStorage permet d'afficher immédiatement les données de la
// dernière visite pendant que la feuille est rechargée en arrière-plan.
const CACHE_KEY = "tarot.cache.v1";

const players = ref([]);
const annonces = ref([]);
const poignees = ref([]);
const bonuses = ref([]);
const games = ref([]);
const loading = ref(false); // aucune donnée à afficher pour l'instant
const refreshing = ref(false); // rechargement (éventuellement en arrière-plan)
const error = ref(null);
// Étapes du chargement initial, affichées par l'écran de démarrage
const loadingSteps = ref([]);

let loadedOnce = false;
const initialLoadDone = ref(false);

function applyData(data) {
    players.value = data.players;
    registerPlayers(data.players);
    annonces.value = data.annonces;
    poignees.value = data.poignees;
    bonuses.value = data.bonuses;
    games.value = data.games;
    loadedOnce = true;
}

function readCache() {
    try {
        const data = JSON.parse(localStorage.getItem(CACHE_KEY));
        return data?.players?.length && data?.games ? data : null;
    } catch {
        return null;
    }
}

function writeCache(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
        // stockage plein ou indisponible : tant pis pour le cache
    }
}

async function load() {
    if (refreshing.value) return;
    error.value = null;

    if (!loadedOnce) {
        const cached = readCache();
        if (cached) {
            applyData(cached);
            initialLoadDone.value = true;
        }
    }

    loading.value = !loadedOnce;
    refreshing.value = true;
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
        const data = {
            players: rules.players,
            annonces: rules.annonces,
            poignees: rules.poignees,
            bonuses: rules.bonuses,
            games: parties.games,
        };
        applyData(data);
        writeCache(data);
    } catch (e) {
        // Si on affiche déjà des données (du cache), on ne bloque pas l'UI
        if (!loadedOnce) error.value = e.message || String(e);
    } finally {
        loading.value = false;
        refreshing.value = false;
        initialLoadDone.value = true;
    }
}

export function useTarotData() {
    if (!loadedOnce && !refreshing.value) load();

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
        refreshing,
        error,
        loadingSteps,
        initialLoadDone,
        lastGame,
        standings,
        refresh: load,
    };
}
