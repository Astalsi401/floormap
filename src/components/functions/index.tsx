import _ from "lodash";
import store, { defaultFontSize, METHOD } from "@store";
import type { Params } from "react-router-dom";
import type { BoothPos, EditForm, FilterData, GetMapElemsResponse, Method, OriginalData, PathType, ResBooth, ResData, ResPillar, ResRoom, ResText, ResWall } from "@types";

export class ColorPicker {
  private colors_: string[];
  private categories_: string[];
  private unknow_: string;
  constructor(colors_: string[], categories_: string[], unknow_: string) {
    this.colors_ = colors_;
    this.categories_ = categories_ || [];
    this.unknow_ = unknow_;
  }
  public colors = (colors_: string[]) => {
    this.colors_ = colors_;
    return this;
  };
  public categories = (categories_: string[]) => {
    this.categories_ = categories_ || [];
    return this;
  };
  public unknow = (unknow_: string) => {
    this.unknow_ = unknow_;
    return this;
  };
  public scale = (category: string) => {
    const i = this.categories_.indexOf(category);
    return this.colors_[i] || this.unknow_;
  };
}

export class FetchData {
  constructor() {}
  private errorHandler = (error: Error) => {
    throw error;
  };
  private getToken = () => localStorage.getItem("token") || "";
  public fetchWrapper = (url: string, options?: RequestInit) =>
    fetch(url, options)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 403) {
          throw new Error("Forbidden");
        } else {
          throw new Error(res.statusText);
        }
      })
      .catch(this.errorHandler);
  public get = (url: string) => this.fetchWrapper(url);
  public post = (url: string, postData = {}) => this.fetchWrapper(url, { method: METHOD.POST, headers: { "Content-Type": "application/json; charset=utf-8", token: this.getToken() }, body: JSON.stringify(postData) });
  public delete = (url: string) => this.fetchWrapper(url, { method: METHOD.DELETE, headers: { token: this.getToken() } });
}
export const fetchData = new FetchData();
const checkLogin = async (): Promise<boolean> => {
  if (!(getSearchParam("edit") === 1 && !store.getState().elementStatus.login)) return true;
  const { login }: { login: boolean } = await fetchData.post(`${import.meta.env.VITE_SERVER_URL}/login`).catch(() => ({ login: false }));
  return login;
};

const useAssetsData = async (server: string): Promise<any[]> => {
  console.warn(`server error: server no response, use default data\nserver: ${server}`);
  return await fetchData.get(`${import.meta.env.BASE_URL}/assets/json/${server.replace(/^\S*\/api\//, "")}.json`).catch(() => []);
};

export const getMapElems = ({ params: { exhibition, year, category, id }, postData, meth = "GET" }: { params: Params; postData?: EditForm; meth?: Method }): { data: Promise<GetMapElemsResponse> } => ({
  data: (async (): Promise<GetMapElemsResponse> => {
    try {
      const assets = `${import.meta.env.BASE_URL}/assets/json/${exhibition}`;
      const server = `${import.meta.env.VITE_SERVER_URL}/api/${exhibition}/${year}/${category}`;
      const boothInfo = meth === METHOD.POST && postData ? await fetchData.post(`${server}/${id}`, { ...postData, corps: postData.corps.map(({ org, info }) => ({ org, info })) }) : meth === METHOD.DELETE ? await fetchData.delete(`${server}/${id}`) : await fetchData.get(server).catch(async () => await useAssetsData(server));
      const elems = await fetchData.get(`${assets}/elems.json`).catch(() => []);
      const texts = await fetchData.get(`${assets}/${year}/texts.json`).catch(() => []);
      const data = { elems: [...elems, ...texts], boothPos: await fetchData.get(`${assets}/boothPos.json`), boothInfo };
      return { data: boothData(data), login: await checkLogin() };
    } catch (error) {
      throw error;
    }
  })(),
});

const prevTranslateScale = (svg: SVGSVGElement) => {
  const [prevx, prevy] = svg.style.translate.replace(/px/g, "").split(" ");
  return { prevx: Number(prevx) || 0, prevy: Number(prevy) || 0, prevScale: Number(svg.style.scale) || 1 };
};

const animation = (elem: SVGSVGElement) => {
  elem.style.transition = "0.4s";
  setTimeout(() => (elem.style.transition = ""), 400);
};

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

export const zoomCalculator = ({ clientX, clientY, graph, svg, r, rMax = 10, animate = false }: { clientX: number; clientY: number; graph: HTMLDivElement; svg: SVGSVGElement; r: number; rMax?: number; animate?: boolean }) => {
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
export const dragCalculator = ({ x, y, svg, animate = false }: { x: number; y: number; svg: SVGSVGElement; animate?: boolean }) => {
  const { prevx, prevy } = prevTranslateScale(svg);
  animate && animation(svg);
  svg.style.translate = `${prevx + x}px ${prevy + y}px`;
};
export const resetViewbox = ({ svg, animate = false }: { svg: SVGSVGElement; animate?: boolean }) => {
  animate && animation(svg);
  Object.assign(svg.style, { scale: "1", translate: "0px 0px" });
};

export const getSearchParam = (name: string) => Number(new URL(window.location.href).searchParams.get(name));

export const boothData = ({ boothInfo, elems, boothPos }: { boothInfo: ResBooth[]; elems: ResPillar[] | ResWall[] | ResRoom[] | ResText[]; boothPos: BoothPos[] }): ResData[] => {
  const edit = getSearchParam("edit");
  const filter: string[] = [];
  return [
    ...boothPos
      .map((d1) => {
        const info = boothInfo.find((d2) => d1.id === d2.id);
        const { pos, path } = pathDraw(boothPos, info);
        const yGroup = _.groupBy(pos, (d) => d.y);
        const xGroup = _.groupBy(pos, (d) => d.x);
        const { key: rowMode } = boothMode(yGroup);
        const { key: colMode } = boothMode(xGroup);
        const w = info?.w || (pos.length > 1 ? rowMode * 300 : d1.w);
        const h = info?.h || (pos.length > 1 ? colMode * 300 : d1.h);
        const minY = pos.length > 1 ? Math.min(...pos.map((d) => d.y)) : d1.y;
        const start = pos.find((d) => d.x === Math.min(...pos.filter((d) => d.y === minY).map((d) => d.x)) && d.y === minY) || { x: 0, y: 0 };
        filter.push(...(info?.booths?.filter((d) => d !== d1.id) || []));
        return { ...d1, ...info, floor: String(d1.floor), w, h, x: info?.x || (pos.length > 1 ? start?.x : d1.x), y: info?.y || (pos.length > 1 ? start?.y : d1.y), p: path };
      })
      .filter((d) => !filter.includes(d.id) && (edit === 1 || (d.cat && d.cat.tc.length > 0) || (d.booths && d.booths.length > 0))), // 刪除已包含在其他攤位的攤位、非編輯模式下隱藏未設定展區(cat)與booths的攤位
    ...elems,
  ];
};

const boothMode = (posGroup: { [key: number]: { x: number; y: number }[] }): { key: number; max: number; [key: string]: number } => {
  const countMap = Object.entries(posGroup).reduce<Record<number, number>>((acc, [_, p]) => ({ ...acc, [p.length]: (acc[p.length] || 0) + 1 }), {});
  return Object.entries(countMap).reduce<{ key: number; max: number; [key: string]: number }>((acc, [lengthStr, count]) => (count > acc.max ? { key: parseInt(lengthStr, 10), max: count } : acc), { key: 0, max: 0 });
};

const pathDraw = (boothPos: BoothPos[], info: ResBooth | undefined): { pos: { x: number; y: number }[]; path: PathType[] } => {
  const defaultPath: PathType[] = [
    { node: "L", x: 300, y: 0 },
    { node: "L", x: 300, y: 300 },
    { node: "L", x: 0, y: 300 },
  ];
  if (!info) return { pos: [], path: defaultPath };
  const pos = boothPos.filter((d) => info.booths.includes(d.id)).map((d) => ({ x: d.x, y: d.y }));
  const path = info.p.length > 0 ? info.p : pos.length > 1 ? boothPath(pos) : defaultPath;
  return { pos, path };
};

const boothPath = (pos: { x: number; y: number }[]): PathType[] => {
  let path: PathType[] = [];
  const posGroup = _.groupBy(pos, (d) => d.y);
  let prevMin: number, prevMax: number, prevPath: PathType;
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

const currentValue = (pos: { x: number; y: number }[], key: string | number) => {
  const row = pos.filter((d) => d.y === Number(key));
  const min = Math.min(...row.map((d) => d.x));
  const max = Math.max(...row.map((d) => d.x));
  return { row, min, max };
};

const addPath = (path: PathType[], val: number, prev: number, boothLen: number): PathType[] => {
  const prevPath = path[path.length - 1];
  return val === prev ? [...path, { node: "L", x: prevPath.x, y: prevPath.y + boothLen }] : [...path, { node: "L", x: prevPath.x + (val - prev), y: prevPath.y }, { node: "L", x: prevPath.x + (val - prev), y: prevPath.y + boothLen }];
};

const checkText = (targetElements: string[], regex: RegExp) => regex.test(targetElements.join(" ").replace(/\r|\n/g, "").replace(/臺/g, "台"));
export const getFilterData = ({ data, tag, lang, regex }: { data: OriginalData[]; tag: string; lang: string; regex: RegExp }) =>
  data.reduce<FilterData[]>((res, d) => {
    const tags = d.tag ? d.tag[lang] : [];
    const corps = d.corps ? d.corps.map((corp) => corp.org[lang]) : [];
    const infos = d.corps ? d.corps.map((corp) => corp.info[lang]) : [];
    const text = d.text ? d.text[lang] : "";
    const cat = d.cat ? d.cat[lang] : "";
    const topic = d.topic ? d.topic[lang] : "";
    const targets = [d.id, text.replace(/\n/g, ""), cat, topic, ...tags];
    const isType = store.getState().types.includes(d.type);
    const hasTag = isType && tag.length === 0 ? true : [d.id, cat, topic, ...tags].includes(tag);
    let hasText = isType && checkText([...targets, ...infos, ...corps], regex);
    const opacity = (hasText && hasTag) || d.type === "icon" ? 0.8 : 0.1;
    const events = d.event ? d.event.map((e) => ({ ...e, title: e.title[lang], topic: e.topic[lang] })) : [];
    if (d.corps && d.corps.length > 0) {
      d.corps.forEach((corp, i) => {
        hasText = checkText([...targets, corp.info[lang], corp.org[lang]], regex);
        res.push({ ...d, ...corp, text, size: d.size[lang] || defaultFontSize, cat, topic, corps: d.corps.map((c) => ({ ...c, org: c.org[lang], info: c.info[lang] })), org: corp.org[lang], info: corp.info[lang], tag: tags, event: events, opacity, draw: i === 0, sidebar: hasText && hasTag });
      });
    } else {
      res.push({ ...d, corps: [], text, size: d.size[lang] || defaultFontSize, cat, topic, tag: tags, event: events, opacity, draw: true, sidebar: isType });
    }
    return res;
  }, []);
