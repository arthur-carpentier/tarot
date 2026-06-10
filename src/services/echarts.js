// Enregistrement tree-shakable d'ECharts : on n'embarque que les modules
// utilisés par les graphiques (courbes d'évolution des points, course de
// barres du film de la saison). Importé par les pages qui affichent un <VChart>.
import { use } from "echarts/core";
import { LineChart, BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export { VChart };
