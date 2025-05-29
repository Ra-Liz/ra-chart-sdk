// 参数类型
export type ChartConfig = {
  type: ChartType; // 图表类型
  data: BarType | ThiType | LineType; // 图表数据
  timelen: TimestampCount; // 时间戳数量
  config: ChartConfigTypeBar | ChartConfigTypeThi; // 图表配置
};
/** 类型 */
export type ChartType = "bar" | "thi" | "line";
/** 时间戳数量 */
export type TimestampCount = number;
/** config数据 */
type ChartConfigType = {
  className: string; // class标识
  title: string; // 标题
  unit: string; // 单位
  marginBottom: number;
  marginTop: number;
  marginLeft: number;
  marginRight: number;
  yTicks: number; // Y轴刻度数量
  values: number[]; // colorscale
  colors: string[]; // colorscale
  titleSize?: string; // 标题字体大小
  titleColor?: string; // 标题字体颜色
  unitSize?: string; // Y轴单位字体大小
  unitColor?: string; // Y轴单位字体颜色
  gridColor?: string; // 网格线颜色
  gridOpacity?: number; // 网格线透明度
  axisLineColor?: string; // 坐标轴线颜色
  axisLineWidth?: number; // 坐标轴线宽度
  axisTextColor?: string; // 坐标轴字体颜色
  axisFontSize?: string; // 坐标轴字体大小
  colorGradient?: boolean; // 是否渐变
  direction?: "right" | "left"; // 时间轴更新方向
};
export type ChartConfigTypeBar = ChartConfigType & {
  renderType?: "barb" | "arrow"; // 风羽图两种绘图方式
  barbWidth?: number; // 风羽图标宽度
  arrowWidth?: number; // 风箭图标宽度
};
export type ChartConfigTypeThi = ChartConfigType & {};

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

// mian.ts 图表实例
export interface ChartInstance {
  renderData: (y1: number, y2: number) => void;
  updateColor: (
    colorGradient: boolean,
    colors: string[],
    values: number[]
  ) => void;
  resize: () => void;
  destroy: () => void;
}
