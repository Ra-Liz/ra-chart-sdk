// 参数类型
export type ChartConfig = {
  /** 图表类型 */
  type: ChartType;
  /** 图表数据 */
  data: BarType | ThiType | LineType;
  /** 数据-时间戳 */
  timelen: TimestampCount;
  /** 图表配置 */
  config: ChartConfigType;
};
/** 时间戳数量 */
export type TimestampCount = number;
/** 类型 */
export type ChartType = "bar" | "thi" | "line";
/** config数据 */
export type ChartConfigType = {
  /** 标识和文本 */
  className: string;
  title: string;
  unit: string;
  /** 布局和刻度 */
  marginBottom: number;
  marginTop: number;
  marginLeft: number;
  marginRight: number;
  interval: number;
  /** 图表颜色和形式 */
  values: number[];
  colors: string[];
  renderType?: "barb" | "arrow";
  /** 样式 */
  titleSize?: string;
  titleColor?: string;
  unitSize?: string;
  unitColor?: string;
  gridColor?: string;
  gridOpacity?: number;
  axisLineColor?: string;
  tickLineColor?: string;
  tickLineWidth?: number;
  axisTextColor?: string;
  axisFontSize?: string;
};

// 不同类型的绘图 数据参数
/** Bar  */
export type BarDatum = [
  timestamp: number,
  height: number,
  windSpeed: number,
  windDirection: number
];
export type BarType = BarDatum[];
/** THI  */
export type ThiDatum = [
  timestamp: number,
  height: number,
  windSpeed: number,
  windDirection: number,
  top: number,
  bottom: number
];
export type ThiType = ThiDatum[];
/** Line  */
export type LineDatum = [height: number, windSpeed: number, extra?: number];
export type LineType = LineDatum[];

// mian.ts 图标实例
export interface ChartInstance {
  renderData: (y1: number, y2: number) => void;
  destroy?(): void;
}
