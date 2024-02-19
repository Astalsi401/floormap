import { createSlice, configureStore } from "@reduxjs/toolkit";
import { ColorPicker } from "../components/functions";

const defaultMapText = {
  categories: {
    tc: ["全齡健康展區", "年度主題館", "醫療機構展區", "智慧醫療展區", "精準醫療展區", "活動進行中"],
    en: ["Consumer Health Products", "Featured Pavilions", "Medical Institutes & Hospitals", "Medical Devices & Equipment", "Diagnostics, Laboratory Equipment & Services", "Event in progress"],
  },
  link: { tc: "zh", en: "en" },
  title: { tc: "展場平面圖", en: "Floor Plan" },
  event: { tc: "活動進行中", en: "Event in progress" },
  header: { tc: "重點必看", en: "Highlights" },
  headerTags: { tc: ["重要活動", "健康大檢測", "醫師力大挑戰"], en: ["Key Events"] },
  download: { tc: "下載", en: "Download" },
  searchPlaceholder: { tc: "關鍵字搜索", en: "Search" },
  remove: { tc: "清除標籤", en: "Clear all" },
  clear: { tc: "清除搜索條件", en: "Clear search" },
  exhibitor: { tc: "聯展單位", en: "Co-exhibitors" },
  activity: { tc: "相關活動", en: "Events" },
};
const regexEscape = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const counterSlice = createSlice({
  name: "map",
  initialState: {
    searchCondition: {
      string: "",
      regex: new RegExp("", "i"),
      tag: "",
      floor: "1",
      lang: "tc",
    },
    elementStatus: {
      load: false,
      isMobile: true,
      height: 0,
      colors: new ColorPicker(["rgba(237,125,49,0.6)", "rgba(153,204,255,1)", "rgba(255,255,0,0.6)", "rgba(0,112,192,0.6)", "rgba(112,48,160,0.6)", "rgb(128, 0, 75, 0.2)"], defaultMapText.categories["tc"], "rgba(255,255,255)"),
      boothInfoData: {},
      smallScreen: false,
      sidebar: true,
      advanced: false,
      boothInfo: false,
      realSize: { w: 19830, h: 16950 },
      tagsHeight: 80,
      sidebarWidth: 40,
      dragStatus: { moving: false, previousTouch: null, previousTouchLength: null, x: 0, y: 0, distance: 0 },
      zoom: { scale: 0.9, x: 0, y: 0 },
    },
    mapText: {},
    floorData: { loaded: false, data: [], memoData: [], filterData: [] },
    types: ["booth", "room"],
  },
  reducers: {
    setData: (state, { payload: { data } }) => {
      state.floorData.data = data.map((d, i) => {
        let eventTime = [],
          textFormat = { tc: [], en: [] },
          tags = d.tag ? d.tag : textFormat;
        if (d.event) {
          const now = new Date();
          eventTime = d.event.map((e) => ({
            ...e,
            timeList: e.timeList.map((time) => ({ start: new Date(time.start), end: new Date(time.end) })),
            active: e.timeList.some((time) => {
              const start = new Date(time.start);
              const end = new Date(time.end);
              const nowDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
              const startDate = new Date(`${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()} 00:00:00`);
              const endDate = new Date(`${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()} 23:59:59`);
              const startTime = new Date(`${nowDate} ${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}`);
              const endTime = new Date(`${nowDate} ${end.getHours()}:${end.getMinutes()}:${end.getSeconds()}`);
              return startDate < now && now < endDate && startTime < now && now < endTime && (e.title.tc.length > 0 || e.title.en.length > 0);
            }),
          }));
          tags = eventTime.some((e) => e.active) ? { tc: [...tags.tc, mapText.event.tc], en: [...tags.en, mapText.event.en] } : tags;
        }
        return { ...d, id: d.id ? d.id : `${d.type}-${d.floor}-${i}`, floor: d.floor.toString(), cat: d.cat ? d.cat : textFormat, topic: d.topic ? d.topic : { tc: "", en: "" }, tag: tags, text: d.text ? d.text : textFormat, size: d.size ? d.size : { tc: 1, en: 1 }, event: eventTime, corps: d.corps ? d.corps.map((corp, i) => ({ ...corp, corpId: `${d.id}-${i}` })) : [] };
      });
      state.floorData.loaded = true;
    },
    pageLoad: (state) => {
      console.count("run pageLoad()");
      const params = new URLSearchParams(window.location.search);
      state.searchCondition = {
        string: params.get("string") || state.searchCondition.string,
        regex: params.get("regex") || state.searchCondition.regex,
        tag: params.get("tag") || state.searchCondition.tag,
        floor: params.get("floor") || state.searchCondition.floor,
        lang: params.get("lang") || (/^zh/i.test(navigator.language) ? "tc" : "en"),
      };
      state.mapText = Object.keys(defaultMapText).reduce((acc, key) => {
        acc[key] = defaultMapText[key][state.searchCondition.lang];
        return acc;
      }, {});
      state.elementStatus = {
        ...state.elementStatus,
        isMobile: /windows phone|android|iPad|iPhone|iPod/i.test(navigator.userAgent || window.opera),
        height: window.innerHeight - state.elementStatus.tagsHeight,
        colors: new ColorPicker(["rgba(237,125,49,0.6)", "rgba(153,204,255,1)", "rgba(255,255,0,0.6)", "rgba(0,112,192,0.6)", "rgba(112,48,160,0.6)", "rgb(128, 0, 75, 0.2)"], state.mapText.categories, "rgba(255,255,255)"),
      };
    },
    setSearchCondition: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        switch (key) {
          case "regex":
            state.searchCondition.regex = new RegExp(
              regexEscape(state.searchCondition.string.replace("臺", "台"))
                .split(" ")
                .filter((s) => s !== "")
                .map((s) => `(?=.*${s})`)
                .join(""),
              "i"
            );
            break;
          default:
            state.searchCondition[key] = payload[key];
        }
      });
    },
    searchChange: (state, { payload: { data } }) => {
      state.floorData.filterData = data;
    },
    langChange: (state) => {
      state.mapText = Object.keys(defaultMapText).reduce((acc, key) => {
        acc[key] = defaultMapText[key][state.searchCondition.lang];
        return acc;
      }, {});
      state.elementStatus = {
        ...state.elementStatus,
        boothInfoData: Object.keys(state.elementStatus.boothInfoData).length === 0 ? {} : state.floorData.filterData.find((d) => d.id === state.elementStatus.boothInfoData.id && d.corpId === state.elementStatus.boothInfoData.corpId),
        colors: state.elementStatus.colors.categories(state.mapText.categories),
      };
      document.title = state.mapText.title;
    },
    resize: (state) => {
      console.count("run resize()");
      const smallScreen = window.innerWidth < 768;
      const sidebar = state.elementStatus.load ? (smallScreen ? state.elementStatus.sidebar : !smallScreen) : smallScreen ? false : true;
      const { innerHeight: height } = window;
      const sidebarWidth = smallScreen ? (sidebar ? height * 0.6 : height - 117) : sidebar ? 300 : 30;
      const tagsHeight = smallScreen ? 100 : 80;
      state.elementStatus = {
        ...state.elementStatus,
        height: height - state.elementStatus.tagsHeight,
        load: true,
        smallScreen: smallScreen,
        sidebar: sidebar,
        sidebarWidth: sidebarWidth,
        tagsHeight: tagsHeight,
      };
    },
    setElementStatus: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state.elementStatus[key] = payload[key];
      });
    },
    resetViewbox: (state) => {
      state.elementStatus.dragStatus = { ...state.elementStatus.dragStatus, x: 0, y: 0 };
      state.elementStatus.zoom = { scale: 0.9, x: 0, y: 0 };
    },
    zoom: (state, { payload: { clientX, clientY, r, graphRef, svgRef, rMax } }) => {
      const box = graphRef.current.getBoundingClientRect();
      let scale = state.elementStatus.zoom.scale * r;
      scale = scale < 0.9 ? 0.9 : scale > rMax ? rMax : scale;
      let w = svgRef.current.clientWidth * state.elementStatus.zoom.scale;
      let h = svgRef.current.clientHeight * state.elementStatus.zoom.scale;
      let x = (graphRef.current.clientWidth - w) / 2 + state.elementStatus.zoom.x + state.elementStatus.dragStatus.x;
      let y = (graphRef.current.clientHeight - h) / 2 + state.elementStatus.zoom.y + state.elementStatus.dragStatus.y;
      let originX = clientX - box.x - x - w / 2;
      let originY = clientY - box.y - y - h / 2;
      let xNew = originX - (originX / state.elementStatus.zoom.scale) * scale + state.elementStatus.zoom.x;
      let yNew = originY - (originY / state.elementStatus.zoom.scale) * scale + state.elementStatus.zoom.y;
      state.elementStatus = { ...state.elementStatus, zoom: { scale: scale, x: xNew, y: yNew } };
    },
    setDragStatus: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state.elementStatus.dragStatus[key] = payload[key];
      });
    },
    drag: (state, { payload: { x, y, force } }) => {
      if (state.elementStatus.dragStatus.moving || force) state.elementStatus = { ...state.elementStatus, dragStatus: { ...state.elementStatus.dragStatus, x: state.elementStatus.dragStatus.x + x, y: state.elementStatus.dragStatus.y + y } };
    },
    manualToggleElement: (state, { payload: { name, value } }) => {
      state.elementStatus[name] = value;
    },
    toggleElement: (state, { payload: { name } }) => {
      state.elementStatus[name] = !state.elementStatus[name];
    },
  },
});

const store = configureStore({
  reducer: counterSlice.reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
export const { langChange, resize, resetViewbox, zoom, pageLoad, setData, searchChange, toggleElement, manualToggleElement, setSearchCondition, setElementStatus, setDragStatus, drag } = counterSlice.actions;
export const resizeAsync = () => (dispatch) => setTimeout(() => dispatch(resize()), 50);
export const regexAsync = () => (dispatch) => setTimeout(() => dispatch(setSearchCondition({ regex: "update" })), 50);
export const zoomCalculator =
  (clientX, clientY, graphRef, svgRef, r, rMax = 10) =>
  (dispatch) => {
    dispatch(zoom({ clientX, clientY, graphRef, svgRef, r, rMax }));
  };
export const dragCalculator =
  (x, y, force = false) =>
  (dispatch) =>
    dispatch(drag({ x, y, force }));
