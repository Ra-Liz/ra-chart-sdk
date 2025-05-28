import * as d3 from "d3";
import type { BarDatum, BarType, ChartConfigType } from "../type";

export class WindBar {
  private container: HTMLElement;
  private data: BarType;
  private config: ChartConfigType;
  private className: string;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private colorScale!: d3.ScaleLinear<string, number, never>;
  private yScale!: d3.ScaleLinear<number, number, never>;
  private xScale!: d3.ScaleTime<number, number, never>;
  private renderType?: string;

  constructor(container: HTMLElement, data: BarType, config: ChartConfigType) {
    this.container = container;
    this.data = data;
    this.config = config;
    this.className = config.className;
    this.renderType = config.renderType;

    this.svg = d3
      .select(this.container)
      .append("svg")
      .attr("class", this.className)
      .attr("width", container.clientWidth)
      .attr("height", container.clientHeight)
      .style("max-width", "100%")
      .style("height", "auto");
  }

  renderData(y1: number, y2: number) {
    if (this.svg) {
      this.svg.remove();
    }
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const {
      className,
      title,
      marginBottom,
      marginTop,
      marginLeft,
      marginRight,
      interval,
      values,
      colors,
      unit,
      titleSize,
      titleColor,
      unitSize,
      unitColor,
      gridColor,
      gridOpacity,
      axisLineColor,
      tickLineColor,
      tickLineWidth,
      axisTextColor,
      axisFontSize,
    } = this.config;

    // TODO: 样式自定义
    this.svg = d3
      .select(this.container)
      .append("svg")
      .attr("class", this.className)
      .attr("width", width)
      .attr("height", height);

    this.yScale = d3
      .scaleLinear()
      .range([height - marginBottom, marginTop])
      .domain([y1, y2]);
    this.xScale = d3
      .scaleTime()
      .range([marginLeft, width - marginRight])
      .domain(
        d3.extent(this.data, (d) => new Date(d[0] * 1000)) as [Date, Date]
      );
    this.colorScale = d3
      .scaleLinear<string, number>()
      .range(colors)
      .domain(values)
      .clamp(true);

    const formatTime = d3.timeFormat("%m-%d %H:%M:%S");
    const xAxis = d3
      .axisBottom<Date>(this.xScale)
      .ticks(5)
      .tickPadding(10)
      .tickSize(-(height - marginBottom - marginTop))
      .tickFormat(formatTime as unknown as (d: Date) => string);
    const yAxis = d3
      .axisLeft<number>(this.yScale)
      .ticks(interval)
      .tickPadding(10)
      .tickSize(-(width - marginLeft - marginRight));

    // 绘制坐标轴
    this.svg
      .append("g")
      .attr("class", "axis--x--top")
      .attr("transform", `translate(0,${marginTop})`)
      .call(
        d3
          .axisTop(this.xScale as d3.AxisScale<d3.AxisDomain>)
          .ticks(4)
          .tickSize(0)
      )
      .call((g) => g.selectAll(".tick text").remove());
    // .call((g) => {
    //   g.call(
    //     d3
    //       .axisTop(this.xScale as d3.AxisScale<d3.AxisDomain>)
    //       .ticks(4)
    //       .tickSize(0)
    //   );
    //   g.selectAll(".tick text").remove();
    //   g.select(".domain")
    //     .attr("stroke", axisLineColor || "#fff")
    //     .attr("stroke-width", 1);
    //   g.selectAll(".tick line")
    //     .attr("stroke", tickLineColor || "#888")
    //     .attr("stroke-width", tickLineWidth || 1);
    // });

    this.svg
      .append("g")
      .attr("class", "axis--y--right")
      .call(
        d3.axisRight(this.yScale as d3.AxisScale<d3.AxisDomain>).tickSize(0)
      )
      .attr("transform", `translate(${width - marginRight},0)`)
      .call((g) => g.selectAll(".tick text").remove());

    // // FIXME: 能拿到元素但是样式赋值失败
    // console.log(
    //   "test: ",
    //   this.svg.selectAll(".axis--x--top .domain, .axis--y--right .domain")
    // );
    // this.svg
    //   .selectAll(".axis--x--top .domain, .axis--y--right .domain")
    //   .attr("stroke", axisLineColor || "#fff")
    //   .attr("stroke-width", 1);
    // this.svg
    //   .selectAll(".axis--x--top .tick line, .axis--y--right .tick line")
    //   .attr("stroke", tickLineColor || "#888")
    //   .attr("stroke-width", tickLineWidth || 1);
    // // FIXME: 拿不到元素
    // console.log("test: ", this.svg.selectAll(".axis--y--right .tick text"));
    // this.svg
    //   .selectAll(".axis--x--top .tick text, .axis--y--right .tick text")
    //   .attr("fill", axisTextColor || "#fff")
    //   .attr("font-size", axisFontSize || "12px");

    // 绘制网格线
    this.svg
      .append("g")
      .attr("class", "grid-x")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .selectAll("line")
      .attr("stroke", gridColor || "#ccc")
      .attr("stroke-opacity", gridOpacity !== undefined ? gridOpacity : 0.4)
      .attr("stroke-dasharray", "3,3");
    this.svg
      .append("g")
      .attr("class", "grid-y")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .selectAll("line")
      .attr("stroke", gridColor || "#ccc")
      .attr("stroke-opacity", gridOpacity !== undefined ? gridOpacity : 0.4)
      .attr("stroke-dasharray", "3,3");

    // Y轴单位
    this.svg
      .append("text")
      .attr("transform", "rotate(0)")
      .attr("y", marginTop - 10)
      .attr("x", marginLeft)
      .attr("font-size", unitSize || "12px")
      .attr("fill", unitColor || "#ffffff")
      .text(unit);

    // 标题
    const titleElement = this.svg
      .append("text")
      .attr("y", marginTop - 10)
      .attr("font-size", titleSize || "14px")
      .attr("fill", titleColor || "#ffffff")
      .text(title);
    const textWidth = titleElement.node()?.getComputedTextLength() || 0;
    titleElement.attr("x", width / 2 - textWidth / 2);

    // clipPath
    this.svg
      .append("clipPath")
      .attr("id", `clip-area-windbar-${className}`)
      .append("rect")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom);

    // 绘制元素
    const clipGroup = this.svg
      .append("g")
      .attr("clip-path", `url(#clip-area-windbar-${className})`)
      .attr("class", `clip-windbar-${className}`);
    clipGroup
      .selectAll("path")
      .data(this.data)
      .enter()
      .append("path")
      .each((d, i, nodes) => {
        this.renderType !== "arrow"
          ? this.drawWindBar(d3.select(nodes[i]), d)
          : this.drawWindArrow(d3.select(nodes[i]), d);
      });
  }

  destroy() {
    this.svg?.remove();
  }

  private drawWindBar(
    path: d3.Selection<SVGPathElement, unknown, null, undefined>,
    data: BarDatum
  ) {
    const vLen = 20;
    const hLen = 10;
    const vInterval = 4;
    const triangle = Math.floor(data[2] / 20);
    const lineLong = Math.floor((data[2] - triangle * 20) / 4);
    const lineShort = data[2] - triangle * 20 - lineLong * 4 > 0 ? 1 : 0;

    const points: [number, number][] = [];
    let pos = -vLen;
    points.push([0, 0], [0, pos]);

    for (let i = 0; i < triangle; i++) {
      points.push([0, pos], [hLen, pos], [hLen, pos], [0, pos + vInterval]);
      pos += vInterval;
    }

    for (let j = 0; j < lineLong; j++) {
      points.push([0, pos], [hLen, pos], [hLen, pos], [0, pos]);
      pos += vInterval;
    }

    for (let k = 0; k < lineShort; k++) {
      points.push([0, pos], [hLen / 2, pos], [hLen / 2, pos], [0, pos]);
      pos += vInterval;
    }

    const x = this.xScale(new Date(data[0] * 1000));
    const y = this.yScale(data[1]);

    path
      .attr("d", `M${points.map((p) => p.join(",")).join("L")}`)
      .attr("transform", `translate(${x}, ${y}) rotate(${data[3]})`)
      .attr("class", `my-bar-${this.className}`)
      .style("stroke", this.colorScale(data[2]))
      .style("fill", "none")
      .style("stroke-width", "2")
      .attr("wind-value", data[2])
      .attr("wind-time", data[0]);
  }

  private drawWindArrow(
    path: d3.Selection<SVGPathElement, unknown, null, undefined>,
    data: BarDatum
  ) {
    const arrowLength = 15;
    const headLength = 5;
    const headWidth = 10;

    const points = [
      [0, 0],
      [arrowLength, 0],
      [arrowLength - headLength, -headWidth / 2],
      [arrowLength, 0],
      [arrowLength - headLength, headWidth / 2],
    ];

    const x = this.xScale(new Date(data[0] * 1000));
    const y = this.yScale(data[1]);

    path
      .attr("d", `M${points.map((p) => p.join(",")).join("L")}`)
      .attr("transform", `translate(${x}, ${y}) rotate(${data[3] - 90 + 180})`)
      .attr("class", `my-arrow-${this.className}`)
      .style("stroke", this.colorScale(data[2]))
      .style("fill", "none")
      .style("stroke-width", "2")
      .attr("wind-value", data[2])
      .attr("wind-time", data[0]);
  }
}
