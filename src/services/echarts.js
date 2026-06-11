// Enregistrement tree-shakable d'ECharts : on n'embarque que les modules
// utilisés par les graphiques (courbes d'évolution des points, course de
// barres du film de la saison). Importé par les pages qui affichent un <VChart>.
import { use } from "echarts/core";
import { LineChart, BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
// ECharts 6 a sorti `grid.containLabel` dans un module à part : sans lui,
// les libellés d'axes peuvent être rognés (et un avertissement est émis).
import { LegacyGridContainLabel } from "echarts/features";
import VChart from "vue-echarts";

use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  CanvasRenderer,
  LegacyGridContainLabel,
]);

export { VChart };
