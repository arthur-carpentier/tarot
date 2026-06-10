import { createRouter, createWebHashHistory } from "vue-router";

import LandingPage from "@/Pages/LandingPage.vue";
import Games from "@/Pages/Games.vue";
import NewGame from "@/Pages/NewGame.vue";
import ChartPage from "@/Pages/Chart.vue";
import Stats from "@/Pages/Stats.vue";
import Season from "@/Pages/Season.vue";
import Players from "@/Pages/Players.vue";
import Rules from "@/Pages/Rules.vue";

// Historique par hash : pas de réécriture d'URL possible sur GitHub Pages.
export default createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: "/", component: LandingPage },
        { path: "/games", component: Games },
        { path: "/new-game", component: NewGame },
        { path: "/chart", component: ChartPage },
        { path: "/stats", component: Stats },
        { path: "/season", component: Season },
        { path: "/players", component: Players },
        { path: "/rules", component: Rules },
        { path: "/:pathMatch(.*)*", redirect: "/" },
    ],
    scrollBehavior: () => ({ top: 0 }),
});
