import { defer } from "react-router-dom";

export class ColorPicker {
  constructor(colors_, categories_, unknow_) {
    this.colors_ = colors_;
    this.categories_ = categories_;
    this.unknow_ = unknow_;
  }
  colors = (colors_) => {
    this.colors_ = colors_;
    return this;
  };
  categories = (categories_) => {
    this.categories_ = categories_;
    return this;
  };
  unknow = (unknow_) => {
    this.unknow_ = unknow_;
    return this;
  };
  scale = (category) => {
    const i = this.categories_.indexOf(category);
    return this.colors_[i] || this.unknow_;
  };
}

export const getMapElems = async ({ params: { year, category } }) => {
  const data = Promise.all([fetch(`${import.meta.env.BASE_URL}/assets/json/${year}/${category}.json`).then((res) => res.json()), fetch(`${import.meta.env.BASE_URL}/assets/json/elems.json`).then((res) => res.json())]).then((res) => res.flat());
  return defer({ data });
};

const prevTranslateScale = (svg) => {
  const [prevx, prevy] = svg.style.translate.replace("px", "").split(" ");
  return { prevx: parseFloat(prevx || 0), prevy: parseFloat(prevy || 0), prevScale: parseFloat(svg.style.scale || 1) };
};

const animation = (elem) => {
  elem.style.transition = "0.4s";
  setTimeout(() => (elem.style.transition = null), 400);
};

const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;

export const zoomCalculator = ({ clientX, clientY, graph, svg, r, rMax = 10, animate = false }) => {
  const box = graph.getBoundingClientRect(),
    { prevx, prevy, prevScale } = prevTranslateScale(svg);
  let scale = prevScale * r;
  scale = round(scale < 0.9 ? 0.9 : scale > rMax ? rMax : scale, 2);
  let w = svg.clientWidth * prevScale,
    h = svg.clientHeight * prevScale,
    x = (graph.clientWidth - w) / 2 + prevx,
    y = (graph.clientHeight - h) / 2 + prevy,
    originX = clientX - box.x - x - w / 2,
    originY = clientY - box.y - y - h / 2,
    xNew = round(originX - (originX / prevScale) * scale + prevx, 2),
    yNew = round(originY - (originY / prevScale) * scale + prevy, 2);
  animate && animation(svg);
  Object.assign(svg.style, { scale, translate: `${xNew}px ${yNew}px` });
};
export const dragCalculator = ({ x, y, svg, animate = false }) => {
  const { prevx, prevy } = prevTranslateScale(svg);
  animate && animation(svg);
  svg.style.translate = `${prevx + x}px ${prevy + y}px`;
};
export const resetViewbox = ({ svg, animate = false }) => {
  animate && animation(svg);
  Object.assign(svg.style, { scale: "1", translate: "0px 0px" });
};
