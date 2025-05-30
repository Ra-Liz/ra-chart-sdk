import { WindBar } from "./charts/windbar";
import { WindThi } from "./charts/windthi";
// import { WindLine } from "./charts/windline";

import type { ChartInstance, ChartConfig } from "./type";

export class raChart implements ChartInstance {
  private chart: ChartInstance;

  constructor(container: HTMLElement, options: ChartConfig) {
    switch (options.type) {
      case "bar":
        this.chart = new WindBar(
          container,
          options.data as any,
          options.config
        );
        break;
      case "thi":
        this.chart = new WindThi(
          container,
          options.data as any,
          options.config
        );
        break;
      // case "line":
      //   this.chart = new WindLine(container, options.data as any, options.config, options.timelen);
      //   break;
      default:
        throw new Error(`Unsupported chart type: ${options.type}`);
    }
  }

  renderData(y1: number, y2: number) {
    this.chart.renderData(y1, y2);
  }

  updateColor(colorGradient: boolean, colors: string[], values: number[]) {
    this.chart.updateColor(colorGradient, colors, values);
  }

  resize() {
    this.chart.resize();
  }

  destroy() {
    this.chart.destroy();
  }
}
