import { defer } from "react-router-dom";

export class ColorPicker {
  constructor(colors_, categories_, unknow_) {
    this.colors_ = colors_;
    this.categories_ = categories_ || [];
    this.unknow_ = unknow_;
  }
  colors = (colors_) => {
    this.colors_ = colors_;
    return this;
  };
  categories = (categories_) => {
    this.categories_ = categories_ || [];
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
  const data = {
    elems: await fetch(`${import.meta.env.BASE_URL}/assets/json/elems.json`)
      .then((res) => res.json())
      .catch(() => []),
    boothInfo: await fetch(import.meta.env.MODE === "development" ? `http://192.168.1.50:3002/api/booths/${year}` : `${import.meta.env.BASE_URL}/assets/json/${year}/${category}.json`)
      .then((res) => res.json())
      .catch(() => []),
    boothPos: await fetch(`${import.meta.env.BASE_URL}/assets/json/boothPos.json`)
      .then((res) => res.json())
      .catch(() => []),
  };
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

export const getSearchParam = (name) => Number(new URL(window.location.href).searchParams.get(name));

export const boothData = ({ boothInfo, elems, boothPos }) => {
  const edit = getSearchParam("edit");
  const defaultPath = [
    { node: "L", x: 300, y: 0 },
    { node: "L", x: 300, y: 300 },
    { node: "L", x: 0, y: 300 },
  ];
  const filter = [];
  return [
    ...boothPos
      .map((d1) => {
        const info = boothInfo.find((d2) => d1.id === d2.id);
        const pos = boothPos.filter((d) => info?.booths?.includes(d.id)).map((d) => ({ x: d.x, y: d.y }));
        const path = boothPath(pos);
        const yGroup = Object.groupBy(pos, (d) => d.y);
        const xGroup = Object.groupBy(pos, (d) => d.x);
        const { key: rowMode } = boothMode(yGroup);
        const { key: colMode } = boothMode(xGroup);
        const w = info?.w || (pos.length > 0 ? rowMode * 300 : d1.w);
        const h = info?.h || (pos.length > 0 ? colMode * 300 : d1.h);
        const minY = pos.length > 0 ? Math.min(...pos.map((d) => d.y)) : d1.y;
        const start = pos.find((d) => d.x === Math.min(...pos.filter((d) => d.y === minY).map((d) => d.x)) && d.y === minY);
        filter.push(...(info?.booths ? info.booths.filter((d) => d !== d1.id) : []));
        return { ...d1, ...info, w, h, x: info?.x || pos.length > 0 ? start.x : d1.x, y: info?.y || pos.length > 0 ? start.y : d1.y, p: info?.p || pos.length > 0 ? path : defaultPath };
      })
      .filter((d) => !filter.includes(d.id) && (edit === 1 || d?.text)),
    ...elems,
  ];
};

const boothMode = (posGroup) => Object.entries(Object.entries(posGroup).reduce((acc, [k, v]) => ({ ...acc, [v.length]: (acc[v.length] || 0) + 1 }), {})).reduce((acc, [k, v]) => ({ max: acc.max > v ? acc.max : v, key: acc.max > v ? acc.key : k }), { max: 0 });

const boothPath = (pos) => {
  let path = [];
  const posGroup = Object.groupBy(pos, (d) => d.y);
  let prevMin, prevMax, prevPath;
  Object.keys(posGroup)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((key, i) => {
      let { row, min, max } = currentValue(pos, key);
      path = i === 0 ? [...path, { node: "L", x: 300 * row.length, y: 0 }, { node: "L", x: 300 * row.length, y: 300 }] : addPath(path, max, prevMax, 300);
      prevMin = min;
      prevMax = max;
    });
  prevPath = path[path.length - 1];
  Object.keys(posGroup)
    .sort((a, b) => Number(b) - Number(a))
    .forEach((key, i) => {
      let { row, min, max } = currentValue(pos, key);
      if (i === 0) path = [...path, { node: "L", x: prevPath.x - row.length * 300, y: prevPath.y }];
      path = addPath(path, min, prevMin, -300);
      prevMin = min;
      prevMax = max;
    });
  return path;
};

const currentValue = (pos, key) => {
  const row = pos.filter((d) => d.y === Number(key));
  const min = Math.min(...row.map((d) => d.x));
  const max = Math.max(...row.map((d) => d.x));
  return { row, min, max };
};

const addPath = (path, val, prev, boothLen) => {
  const prevPath = path[path.length - 1];
  return val === prev ? [...path, { node: "L", x: prevPath.x, y: prevPath.y + boothLen }] : [...path, { node: "L", x: prevPath.x + (val - prev), y: prevPath.y }, { node: "L", x: prevPath.x + (val - prev), y: prevPath.y + boothLen }];
};
