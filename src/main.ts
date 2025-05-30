import { WindBar } from "./charts/windbar";
import { WindThi } from "./charts/windthi";
import { Profile } from "./charts/peofile";

import type {
  ChartInstance,
  ChartConfig,
  BarType,
  ThiType,
  ProfileType,
} from "./type";

export class raChart implements ChartInstance {
  private chart: ChartInstance;

  constructor(container: HTMLElement, options: ChartConfig) {
    switch (options.type) {
      case "bar":
        this.chart = new WindBar(
          container,
          options.data as BarType,
          options.config as any
        );
        break;
      case "thi":
        this.chart = new WindThi(
          container,
          options.data as ThiType,
          options.config as any
        );
        break;
      case "line":
        this.chart = new Profile(
          container,
          options.data as ProfileType,
          options.config
        );
        break;
      default:
        throw new Error(`Unsupported chart type: ${options.type}`);
    }
  }

  renderData(y1: number, y2: number) {
    this.chart.renderData(y1, y2);
  }

  updateColor(colorGradient: boolean, colors: string[], values: number[]) {
    if (this.chart.updateColor) {
      this.chart.updateColor(colorGradient, colors, values);
    }
  }

  resize() {
    this.chart.resize();
  }

  destroy() {
    this.chart.destroy();
  }
}
