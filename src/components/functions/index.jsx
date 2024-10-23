import { defer } from "react-router-dom";
import store, { defaultFontSize } from "@store";

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

class FetchData {
  constructor() {
    this.errorHandler = (error) => {
      console.error(error);
    };
  }
  get = async (url, errorHandler) =>
    await fetch(url)
      .then((res) => res.json())
      .catch(errorHandler || this.errorHandler);
  post = (url, postData, errorHandler) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(postData) })
      .then((res) => res.json())
      .catch(errorHandler || this.errorHandler);
}
const fetchData = new FetchData();

export const getMapElems = ({ params: { year, category, id }, postData = null }) => {
  const data = (async () => {
    const assets = `${import.meta.env.BASE_URL}/assets/json`;
    const server = `${import.meta.env.VITE_SERVER_URL}/api`;
    return boothData({
      elems: await fetchData.get(`${assets}/elems.json`),
      boothInfo: postData === null ? await fetchData.get(import.meta.env.MODE === "development" ? `${server}/get/${category}/${year}` : `${assets}/${year}/${category}.json`) : await fetchData.post(`${server}/update/${category}/${year}/${id}`, postData),
      boothPos: await fetchData.get(`${assets}/boothPos.json`),
    });
  })();
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
  const filter = [];
  return [
    ...boothPos
      .map((d1) => {
        const info = boothInfo.find((d2) => d1.id === d2.id);
        const { pos, path } = pathDraw(boothPos, info);
        const yGroup = Object.groupBy(pos, (d) => d.y);
        const xGroup = Object.groupBy(pos, (d) => d.x);
        const { key: rowMode } = boothMode(yGroup);
        const { key: colMode } = boothMode(xGroup);
        const w = info?.w || (pos.length > 1 ? rowMode * 300 : d1.w);
        const h = info?.h || (pos.length > 1 ? colMode * 300 : d1.h);
        const minY = pos.length > 1 ? Math.min(...pos.map((d) => d.y)) : d1.y;
        const start = pos.find((d) => d.x === Math.min(...pos.filter((d) => d.y === minY).map((d) => d.x)) && d.y === minY);
        filter.push(...(info?.booths?.filter((d) => d !== d1.id) || []));
        return { ...d1, ...info, w, h, x: info?.x || (pos.length > 1 ? start.x : d1.x), y: info?.y || (pos.length > 1 ? start.y : d1.y), p: path };
      })
      .filter((d) => !filter.includes(d.id) && (edit === 1 || d?.cat?.tc?.length > 0 || d?.booths?.length > 0)), //   刪除已包含在其他攤位的攤位、非編輯模式下隱藏未設定展區(cat)與booths的攤位
    ...elems,
  ];
};

const boothMode = (posGroup) => Object.entries(Object.entries(posGroup).reduce((acc, [k, v]) => ({ ...acc, [v.length]: (acc[v.length] || 0) + 1 }), {})).reduce((acc, [k, v]) => ({ max: acc.max > v ? acc.max : v, key: acc.max > v ? acc.key : k }), { max: 0 });

const pathDraw = (boothPos, info) => {
  const defaultPath = [
    { node: "L", x: 300, y: 0 },
    { node: "L", x: 300, y: 300 },
    { node: "L", x: 0, y: 300 },
  ];
  const pos = boothPos.filter((d) => info?.booths?.includes(d.id)).map((d) => ({ x: d.x, y: d.y }));
  const path = info?.p?.length > 0 ? info.p : pos.length > 1 ? boothPath(pos) : defaultPath;
  return { pos, path };
};

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

const checkText = (targetElements, regex) => regex.test(targetElements.join(" ").replace(/\r|\n/g, "").replace("臺", "台"));
export const getFilterData = ({ data, tag, lang, regex }) =>
  data.reduce((res, d) => {
    const tags = d.tag ? d.tag[lang] : [];
    const corps = d.corps ? d.corps.map((corp) => corp.org[lang]) : [];
    const infos = d.corps ? d.corps.map((corp) => corp.info[lang]) : [];
    const text = d.text ? d.text[lang] : "";
    const cat = d.cat ? d.cat[lang] : "";
    const topic = d.topic ? d.topic[lang] : "";
    const targets = [d.id, text.replace("\n", ""), cat, topic, ...tags];
    const isType = store.getState().types.includes(d.type);
    const hasTag = isType && tag.length === 0 ? true : [d.id, cat, topic, ...tags].includes(tag);
    let hasText = isType && checkText([...targets, ...infos, ...corps], regex);
    const opacity = (hasText && hasTag) || d.type === "icon" ? 0.8 : 0.1;
    const events = d.event ? d.event.map((e) => ({ ...e, title: e.title[lang], topic: e.topic[lang] })) : [];
    if (d.corps && d.corps.length > 0) {
      d.corps.forEach((corp, i) => {
        hasText = checkText([...targets, corp.info[lang], corp.org[lang]], regex);
        res.push({ ...d, ...corp, text, size: d?.size?.[lang] || defaultFontSize, cat, topic, corps: d.corps.map((c) => ({ ...c, org: c.org[lang], info: c.info[lang] })), org: corp.org[lang], info: corp.info[lang], tag: tags, event: events, opacity, draw: i === 0, sidebar: hasText && hasTag });
      });
    } else {
      res.push({ ...d, text, size: d?.size?.[lang] || defaultFontSize, cat, topic, tag: tags, event: events, opacity, draw: true, sidebar: isType });
    }
    return res;
  }, []);
