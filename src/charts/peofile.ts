import * as d3 from "d3";
import type { ProfileType, ChartConfigProfile } from "../type";

export class Profile {
  // 定义svg变量
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null =
    null;
  // 定义y轴比例尺变量
  private yScale!: d3.ScaleLinear<number, number, never>;
  // 定义x轴比例尺变量
  private xScale!: d3.ScaleLinear<number, number, never>;
  // 定义缩放行为变量
  private zoom!: d3.ZoomBehavior<SVGSVGElement, unknown>;
  // 定义x轴变量
  private xAxis!: d3.Axis<number>;
  // 定义y轴变量
  private yAxis!: d3.Axis<number>;
  // 定义x轴网格线变量
  private gridX!: d3.Selection<SVGGElement, unknown, null, undefined>;
  // 定义y轴网格线变量
  private gridY!: d3.Selection<SVGGElement, unknown, null, undefined>;
  // tooltip
  private tooltip: d3.Selection<
    HTMLDivElement,
    unknown,
    null,
    undefined
  > | null = null;
  // y1 y2
  private y1: number = 0;
  private y2: number = 0;
  // dblclick
  private selectedTime!: number;
  private timeTriangle!:
    | d3.Selection<SVGPathElement, unknown, null, undefined>
    | undefined;

  // 定义容器变量
  private container: HTMLElement;
  // 定义数据变量
  private data: ProfileType;
  // 定义配置变量
  private config: ChartConfigProfile;
  // 定义类名变量
  private className: string;

  // 构造函数
  constructor(
    container: HTMLElement,
    data: ProfileType,
    config: ChartConfigProfile
  ) {
    this.container = container;
    this.data = data;
    this.config = config;
    this.className = config.className;
  }

  // 渲染数据
  renderData() {
    if (this.svg) {
      this.svg.remove();
      this.svg = null;
    }
    const {
      className,
      title,
      marginBottom = 20,
      marginTop = 20,
      marginLeft = 40,
      marginRight = 40,
      yTicks = 5,
      unit,
      titleSize,
      titleColor,
      unitSize,
      unitColor,
      gridColor,
      gridOpacity,
      axisLineColor,
      axisLineWidth,
      axisTextColor,
      axisFontSize,
      lineColor,
      lineWidth,
      valueLabel,
      valueUnit,
      circleRadius,
    } = this.config;

    // 创建svg元素
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.svg = d3
      .select(this.container)
      .append("svg")
      .attr("class", this.className)
      .attr("width", width)
      .attr("height", height)
      .style("max-width", "100%")
      .style("max-height", "100%");

    // 创建y轴比例尺
    this.yScale = d3
      .scaleLinear()
      .range([height - marginBottom, marginTop])
      .domain([0, d3.max(this.data, (d) => d[0])] as [number, number]);

    // 创建x轴比例尺
    this.xScale = d3
      .scaleLinear()
      .range([marginLeft, width - marginRight])
      .domain(d3.extent(this.data, (d) => d[1]) as [number, number])
      .nice();
    // 绘制坐标轴
    this.xAxis = d3
      .axisBottom<number>(this.xScale)
      .ticks(5)
      .tickPadding(10)
      .tickSize(-(height - marginBottom - marginTop))
      .tickFormat((d: number): any => {
        function sciCounting(num: number) {
          if (Math.abs(num) < 0.01 && num !== 0) {
            return num.toExponential(0);
          } else {
            return num;
          }
        }
        return sciCounting(d);
      });
    this.yAxis = d3
      .axisLeft<number>(this.yScale)
      .ticks(yTicks)
      .tickPadding(10)
      .tickSize(-(width - marginLeft - marginRight));
    this.svg
      .append("g")
      .attr("class", "axis--x--top")
      .attr("transform", `translate(0,${marginTop})`)
      .call((g) => {
        g.call(d3.axisTop(this.xScale).ticks(4).tickSize(0));
        g.selectAll(".tick text").remove();
        g.select(".domain")
          .attr("stroke", axisLineColor || "#fff")
          .attr("stroke-width", axisLineWidth || 1);
      });
    this.svg
      .append("g")
      .attr("class", "axis--y--right")
      .attr("transform", `translate(${width - marginRight},0)`)
      .call((g) => {
        g.call(d3.axisRight(this.yScale).tickSize(0));
        g.selectAll(".tick text").remove();
        g.select(".domain")
          .attr("stroke", axisLineColor || "#fff")
          .attr("stroke-width", axisLineWidth || 1);
      });

    // 绘制网格线
    this.gridX = this.svg
      .append("g")
      .attr("class", "grid-x")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call((g) => {
        g.call(this.xAxis);
        const ticks = g.selectAll(".tick").nodes();
        ticks.forEach((tick, i) => {
          if (i === 0 || i === ticks.length - 1) {
            d3.select(tick).select("line").style("display", "none");
          }
        });
        g.selectAll(".tick text")
          .attr("fill", axisTextColor || "#fff")
          .attr("font-size", axisFontSize || "12px");
        g.selectAll("line")
          .attr("stroke", gridColor || "#ccc")
          .attr("stroke-opacity", gridOpacity ?? 0.4)
          .attr("stroke-dasharray", "3,3");
        g.select(".domain")
          .attr("stroke", axisLineColor || "#fff")
          .attr("stroke-width", axisLineWidth || 1);
      });
    this.gridY = this.svg
      .append("g")
      .attr("class", "grid-y")
      .attr("transform", `translate(${marginLeft},0)`)
      .call((g) => {
        g.call(this.yAxis);
        const ticks = g.selectAll(".tick").nodes();
        ticks.forEach((tick, i) => {
          if (i === 0 || i === ticks.length - 1) {
            d3.select(tick).select("line").style("display", "none");
          }
        });
        g.selectAll(".tick text")
          .attr("fill", axisTextColor || "#fff")
          .attr("font-size", axisFontSize || "12px");
        g.selectAll("line")
          .attr("stroke", gridColor || "#ccc")
          .attr("stroke-opacity", gridOpacity ?? 0.4)
          .attr("stroke-dasharray", "3,3");
        g.select(".domain")
          .attr("stroke", axisLineColor || "#fff")
          .attr("stroke-width", axisLineWidth || 1);
      });

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
      .attr("id", `clip-area-profile-${className}`)
      .append("rect")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom);

    const clipGroup = this.svg
      .append("g")
      .attr("clip-path", `url(#clip-area-profile-${className})`)
      .attr("class", `clip-profile-${className}`);

    // 廓线和圆点
    const line = d3
      .line()
      .x((d) => this.xScale(d[1]))
      .y((d) => this.yScale(d[0]));
    clipGroup
      .append("g")
      .attr("class", `line-${this.className}`)
      .append("path")
      .attr("fill", "none")
      .attr("stroke", lineColor ?? "steelblue")
      .attr("stroke-width", lineWidth ?? 2)
      .attr("d", line(this.data));
    circleRadius &&
      clipGroup
        .selectAll("circle")
        .attr("class", `circle-${this.className}`)
        .data(this.data)
        .enter()
        .append("circle")
        .attr("cx", (d) => this.xScale(d[1]))
        .attr("cy", (d) => this.yScale(d[0]))
        .attr("r", circleRadius)
        .attr("fill", lineColor ?? "steelblue");

    const tooltip = this.svg.append("g");
    const bisect = d3.bisector((d: number[]) => d[0]).center;
    const pointermoved = (event: any) => {
      const i = bisect(this.data, this.yScale.invert(d3.pointer(event)[1]));
      tooltip.style("display", null);
      tooltip.attr(
        "transform",
        `translate(${this.xScale(this.data[i][1])},${this.yScale(
          this.data[i][0]
        )})`
      );
      let moveX = this.xScale(this.data[i][1]);
      let moveY = this.yScale(this.data[i][0]);
      let tooRight = moveX >= this.container.clientWidth - 60;
      let tooBottom = moveY >= this.container.clientHeight - 60;
      let tooLeft = moveX <= 60;
      const path = tooltip
        .selectAll("path")
        .data([,])
        .join("path")
        .attr("fill", "black")
        .attr("stroke", "white");
      const text = tooltip
        .selectAll("text")
        .data([,])
        .join("text")
        .call((text) =>
          text
            .selectAll("tspan")
            .data([formatValue(this.data[i][1]), formatHeight(this.data[i][0])])
            .join("tspan")
            .attr("x", 0)
            .attr("y", (_, i) => `${i * 1.1}em`)
            .attr("fill", "white")
            .text((d) => {
              return d;
            })
        );
      size(text, path, tooBottom, tooRight, tooLeft);
    };
    function pointerleft() {
      tooltip.style("display", "none");
    }
    function formatValue(value: number) {
      return `${valueLabel}: ${value}${valueUnit}`;
    }
    function formatHeight(height: number) {
      return `高度: ${height}m`;
    }
    function size(
      text: any,
      path: any,
      tooBottom: boolean,
      tooRight: boolean,
      tooLeft: boolean = false
    ) {
      const { x, y, width: w, height: h } = text.node().getBBox();
      if (tooBottom) {
        if (tooRight) {
          text.attr("transform", `translate(${-(w + 10)},${-h})`);
          path.attr("d", `M${-w - 15},-5H-5l5,5l5,-5v${-h - 20}h-${w + 20}z`);
        } else if (tooLeft) {
          text.attr("transform", `translate(${10},${-h})`);
          path.attr("d", `M${w + 15},-5H5l-5,5l-5,-5v${-h - 20}h${w + 20}z`);
        } else {
          text.attr("transform", `translate(${-w / 2},${-h})`);
          path.attr(
            "d",
            `M${-w / 2 - 10},-5H-5l5,5l5,-5H${w / 2 + 10}v${-h - 20}h-${
              w + 20
            }z`
          );
        }
      } else {
        if (tooRight) {
          text.attr("transform", `translate(${-(w + 10)},${15 - y})`);
          path.attr("d", `M${-w - 15},5H-5l5,-5l5,5v${h + 20}h-${w + 20}z`);
        } else if (tooLeft) {
          text.attr("transform", `translate(${10},${15 - y})`);
          path.attr("d", `M${w + 15},5H5l-5,-5l-5,5v${h + 20}h${w + 20}z`);
        } else {
          text.attr("transform", `translate(${-w / 2},${15 - y})`);
          path.attr(
            "d",
            `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
          );
        }
      }
    }

    this.svg
      .on("pointerenter pointermove", pointermoved.bind(this))
      .on("pointerleave", pointerleft.bind(this))
      .on("touchstart", (event) => event.preventDefault());
    // // 创建缩放行为 => 与tooltip冲突
    // this.zoom = d3
    //   .zoom<SVGSVGElement, unknown>()
    //   .scaleExtent([1, 5])
    //   .extent([
    //     [marginLeft, 0],
    //     [width - marginRight, height],
    //   ])
    //   .translateExtent([
    //     [marginLeft, -0],
    //     [width - marginRight, height],
    //   ])
    //   .on("zoom", this.zoomed);
    // this.svg
    //   .call(this.throttle(this.zoom, 60))
    //   .on("wheel", (event) => event.preventDefault())
    //   .on("dblclick.zoom", null);
  }
  // resize
  resize() {
    this.renderData();
  }
  // 销毁函数
  destroy() {
    this.svg?.remove();
    this.svg = null;
  }

  // 节流
  private throttle(fn: (...args: any[]) => void, delay: number) {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  }

  // 缩放事件处理函数
  private zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
    const transform = event.transform;
    const newXScale = transform.rescaleX(this.xScale);
    const newYScale = transform.rescaleY(this.yScale);
    requestAnimationFrame(() => {
      // 更新坐标轴
      this.gridX.call(
        (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
          g.call(this.xAxis.scale(newXScale));
          g.selectAll(".tick text")
            .attr("fill", this.config.axisTextColor || "#fff")
            .attr("font-size", this.config.axisFontSize || "12px");
          g.selectAll("line")
            .attr("stroke", this.config.gridColor || "#ccc")
            .attr("stroke-opacity", this.config.gridOpacity ?? 0.4)
            .attr("stroke-dasharray", "3,3");
          g.select(".domain")
            .attr("stroke", this.config.axisLineColor || "#fff")
            .attr("stroke-width", this.config.axisLineWidth || 1);
        }
      );
      this.gridY.call(
        (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
          g.call(this.yAxis.scale(newYScale));
          g.selectAll(".tick text")
            .attr("fill", this.config.axisTextColor || "#fff")
            .attr("font-size", this.config.axisFontSize || "12px");
          g.selectAll("line")
            .attr("stroke", this.config.gridColor || "#ccc")
            .attr("stroke-opacity", this.config.gridOpacity ?? 0.4)
            .attr("stroke-dasharray", "3,3");
          g.select(".domain")
            .attr("stroke", this.config.axisLineColor || "#fff")
            .attr("stroke-width", this.config.axisLineWidth || 1);
        }
      );
      // 更新line
      d3.selectAll(`.line-${this.className},.line-${this.className}`).attr(
        "transform",
        `translate(${transform.x}, ${transform.y}) scale(${transform.k})`
      );
    });
  };
}
