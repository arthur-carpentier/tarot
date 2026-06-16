import { createRouter, createWebHashHistory } from "vue-router";

import LandingPage from "@/Pages/LandingPage.vue";
import Today from "@/Pages/Today.vue";
import Games from "@/Pages/Games.vue";
import NewGame from "@/Pages/NewGame.vue";
import ChartPage from "@/Pages/Chart.vue";
import Replay from "@/Pages/Replay.vue";
import Stats from "@/Pages/Stats.vue";
import Season from "@/Pages/Season.vue";
import Players from "@/Pages/Players.vue";
import Player from "@/Pages/Player.vue";
import Rules from "@/Pages/Rules.vue";

// Historique par hash : pas de réécriture d'URL possible sur GitHub Pages.
export default createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: "/", component: LandingPage },
        { path: "/today", component: Today },
        { path: "/games", component: Games },
        { path: "/new-game", component: NewGame },
        { path: "/chart", component: ChartPage },
        { path: "/replay", component: Replay },
        { path: "/stats", component: Stats },
        { path: "/season", component: Season },
        { path: "/players", component: Players },
        { path: "/player/:name", component: Player },
        { path: "/rules", component: Rules },
        { path: "/:pathMatch(.*)*", redirect: "/" },
    ],
    scrollBehavior: () => ({ top: 0 }),
});
