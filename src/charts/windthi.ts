import * as d3 from "d3";
import type { ThiType, ChartConfigTypeThi } from "../type";

export class WindThi {
  // 定义svg变量
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null =
    null;
  // 定义颜色比例尺变量
  private colorScale!:
    | d3.ScaleLinear<string, number, never>
    | d3.ScaleThreshold<number, string, never>;
  // 定义y轴比例尺变量
  private yScale!: d3.ScaleLinear<number, number, never>;
  // 定义x轴比例尺变量
  private xScale!: d3.ScaleTime<number, number, never>;
  // 定义缩放行为变量
  private zoom!: d3.ZoomBehavior<SVGSVGElement, unknown>;
  // 定义x轴变量
  private xAxis!: d3.Axis<Date>;
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
  private data: ThiType;
  // 定义配置变量
  private config: ChartConfigTypeThi;
  // 定义类名变量
  private className: string;

  // 构造函数
  constructor(
    container: HTMLElement,
    data: ThiType,
    config: ChartConfigTypeThi
  ) {
    this.container = container;
    this.data = data;
    this.config = config;
    this.className = config.className;
  }

  // 渲染数据
  renderData(y1: number, y2: number) {
    this.y1 = y1;
    this.y2 = y2;
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
      axisLineWidth,
      axisTextColor,
      axisFontSize,
      colorGradient,
      direction,
      dblClick,
      dblInit,
      valueLabel,
      valueUnit,
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
      .domain([y1, y2]);

    // 创建x轴比例尺
    if (direction !== "right") {
      this.xScale = d3
        .scaleTime()
        .range([marginLeft, width - marginRight])
        .domain(
          d3.extent(this.data, (d) => new Date(d[0] * 1000)) as [Date, Date]
        );
    } else {
      this.xScale = d3
        .scaleTime()
        .range([width - marginRight, marginLeft])
        .domain(
          d3.extent(this.data, (d) => new Date(d[0] * 1000)) as [Date, Date]
        );
    }

    // 创建颜色比例尺
    if (colorGradient) {
      this.colorScale = d3
        .scaleLinear<string, number>()
        .range(colors)
        .domain(values)
        .clamp(true);
    } else {
      this.colorScale = d3
        .scaleThreshold<number, string>()
        .range(colors)
        .domain(values);
    }

    // 创建时间格式化函数
    const formatTime = d3.timeFormat("%m-%d %H:%M:%S");
    // 绘制坐标轴
    this.xAxis = d3
      .axisBottom<Date>(this.xScale)
      .ticks(5)
      .tickPadding(10)
      .tickSize(-(height - marginBottom - marginTop))
      .tickFormat(formatTime as unknown as (d: Date) => string);
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
      .attr("id", `clip-area-windthi-${className}`)
      .append("rect")
      .attr("x", marginLeft)
      .attr("y", marginTop)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", height - marginTop - marginBottom);

    // 绘制tooltip
    this.tooltip =
      this.tooltip ||
      d3
        .select(this.container)
        .append("div")
        .attr("class", `tooltip-${this.className}`)
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("padding", "6px 8px")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "#fff")
        .style("font-size", "12px")
        .style("border-radius", "4px")
        .style("visibility", "hidden")
        .style("z-index", "10");
    let tooltipWidth = 0;
    let tooltipHeight = 0;
    // tooltip定位
    const throttledMoveHandler = this.throttle((event: MouseEvent) => {
      let x = event.offsetX;
      let y = event.offsetY;
      if (x + tooltipWidth + 18 > width) {
        x = x - tooltipWidth - 20;
      }
      if (y + tooltipHeight + 18 > height) {
        y = y - tooltipHeight - 20;
      }
      this.tooltip?.style("top", `${y + 10}px`).style("left", `${x + 10}px`);
    }, 100);
    // 绘制元素
    const clipGroup = this.svg
      .append("g")
      .attr("clip-path", `url(#clip-area-windthi-${className})`)
      .attr("class", `clip-windthi-${className}`);

    const timelen = new Set(this.data.map((item) => item[0])).size;
    const rectWidth = (width - marginLeft - marginRight) / timelen;
    clipGroup
      .selectAll("rect")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("x", (d) => this.xScale(new Date(d[0] * 1000)) - rectWidth / 2)
      .attr("y", (d) => this.yScale(Math.abs(d[1] + d[4])))
      .attr("width", rectWidth)
      .attr("class", `my-rect-${this.className}`)
      .attr("height", (d) =>
        Math.abs(this.yScale(d[4] + d[1]) - this.yScale(d[1] - d[5]))
      )
      .attr("fill", (d) => this.colorScale(d[2]))
      .attr("stroke", (d) => this.colorScale(d[2]))
      .each((d, i, nodes) => {
        const el = d3.select(nodes[i]);
        el.on("mouseover", (event) => {
          el.style("filter", "brightness(150%)");
          this.tooltip?.style("visibility", "visible").html(
            `
              <div><strong>时间：</strong>${formatTime(
                new Date(d[0] * 1000)
              )}</div>
              <div><strong>高度：</strong>${d[1]} m</div>
              <div><strong>${valueLabel}：</strong>${d[2]} ${valueUnit}</div>
            `
          );
          if (tooltipWidth === 0 || tooltipHeight === 0) {
            tooltipWidth =
              this.tooltip!.node()?.getBoundingClientRect().width || 0;
            tooltipHeight =
              this.tooltip!.node()?.getBoundingClientRect().height || 0;
          }
        })
          .on("mousemove", throttledMoveHandler)
          .on("mouseout", () => {
            el.style("filter", null);
            this.tooltip?.style("visibility", "hidden");
          });
        if (dblClick) {
          el.on("dblclick", (event) => {
            // TODO: test
            const value = event.target["__data__"][0];
            this.selectedTime = +value;
            this.renderSelectLine(+value);
          });
        }
      });

    if (dblInit) {
      this.initSelectLine();
    }

    // 创建缩放行为
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5])
      .extent([
        [marginLeft, 0],
        [width - marginRight, height],
      ])
      .translateExtent([
        [marginLeft, -0],
        [width - marginRight, height],
      ])
      .on("zoom", this.zoomed);
    this.svg
      .call(this.throttle(this.zoom, 60))
      .on("wheel", (event) => event.preventDefault())
      .on("dblclick.zoom", null);
  }
  // 更新颜色
  updateColor(colorGradient: boolean, colors: string[], values: number[]) {
    // 创建颜色比例尺
    if (colorGradient) {
      this.colorScale = d3
        .scaleLinear<string, number>()
        .range(colors)
        .domain(values)
        .clamp(true);
    } else {
      this.colorScale = d3
        .scaleThreshold<number, string>()
        .range(colors)
        .domain(values);
    }
    d3.selectAll(`.my-rect-${this.className}`)
      .attr("fill", (d: any) => this.colorScale(d[2]))
      .attr("stroke", (d: any) => this.colorScale(d[2]));
  }
  // resize
  resize() {
    this.renderData(this.y1, this.y2);
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

      // 更新图形元素
      d3.selectAll(`.my-rect-${this.className}`).attr(
        "transform",
        `translate(${transform.x}, ${transform.y}) scale(${transform.k})`
      );

      // 时间三角
      if (this.selectedTime && this.timeTriangle) {
        let x = this.xScale(this.selectedTime * 1000);
        let weiyiX = (x - 5) * transform.k + transform.x;
        const {
          marginBottom = 20,
          marginLeft = 40,
          marginRight = 40,
        } = this.config;
        const height = this.container.clientHeight;
        const width = this.container.clientWidth;
        if (weiyiX < marginLeft || weiyiX > width - marginRight) {
          this.timeTriangle
            .attr(
              "transform",
              `translate(${x * transform.k + transform.x - 5},${
                height - marginBottom + 10
              } )scale(1)`
            )
            .style("display", "none");
        } else {
          this.timeTriangle
            .attr(
              "transform",
              `translate(${x * transform.k + transform.x - 5},${
                height - marginBottom + 10
              } )scale(1)`
            )
            .style("display", "block");
        }
      }
    });
  };

  // 绘制dbl line
  private renderSelectLine(time: number) {
    const { dblClick } = this.config;
    let lineData = this.data.filter((d) => {
      return d[0] === time;
    });
    if (dblClick) {
      dblClick(lineData);
    }
    const x = this.xScale(time * 1000);
    const y = this.container.clientHeight - (this.config.marginBottom ?? 20);
    const topTriangleData = "M0,0 L10,0 L5,-10 Z";
    if (this.timeTriangle) {
      this.timeTriangle.attr("transform", `translate(${x - 5},${y + 10})`);
    } else {
      this.timeTriangle = this.svg
        ?.append("g")
        .append("path")
        .attr("d", topTriangleData)
        .attr("transform", `translate(${x - 5},${y + 10})`)
        .attr("class", `select-line-${this.className}`)
        .attr("fill", this.config.dblColor ?? "steelblue");
    }
  }

  // 初始化一个dbl line
  private initSelectLine() {
    this.selectedTime = this.data[this.data.length - 1][0];
    this.renderSelectLine(this.selectedTime);
  }
}
