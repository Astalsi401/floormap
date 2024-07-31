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
  console.log("run getMapElems()");
  const data = Promise.all([fetch(`${import.meta.env.BASE_URL}/assets/json/${year}/${category}.json`).then((res) => res.json()), fetch(`${import.meta.env.BASE_URL}/assets/json/elems.json`).then((res) => res.json())]).then((res) => res.flat());
  return defer({ data });
};

export const zoomCalculator = (clientX, clientY, graphRef, svgRef, r, rMax = 10) => {
  const box = graphRef.current.getBoundingClientRect();
  const prevScale = parseFloat(svgRef.current.style.scale || 1);
  let [prevx, prevy] = svgRef.current.style.translate.replace("px", "").split(" ");
  prevx = parseFloat(prevx || 0);
  prevy = parseFloat(prevy || 0);
  let scale = prevScale * r;
  scale = scale < 0.9 ? 0.9 : scale > rMax ? rMax : scale;
  let w = svgRef.current.clientWidth * prevScale;
  let h = svgRef.current.clientHeight * prevScale;
  let x = (graphRef.current.clientWidth - w) / 2 + prevx;
  let y = (graphRef.current.clientHeight - h) / 2 + prevy;
  let originX = clientX - box.x - x - w / 2;
  let originY = clientY - box.y - y - h / 2;
  let xNew = originX - (originX / prevScale) * scale + prevx;
  let yNew = originY - (originY / prevScale) * scale + prevy;
  svgRef.current.style.scale = scale;
  svgRef.current.style.translate = `${xNew}px ${yNew}px`;
};
export const dragCalculator = (x, y, svgRef) => {
  const [prevx, prevy] = svgRef.current.style.translate.replace("px", "").split(" ");
  svgRef.current.style.translate = `${parseFloat(prevx || 0) + x}px ${parseFloat(prevy || 0) + y}px`;
};
export const resetViewbox = (svgRef) => {
  svgRef.current.style.scale = "0.9";
  svgRef.current.style.translate = "0px 0px";
};
