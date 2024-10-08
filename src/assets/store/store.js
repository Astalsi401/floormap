import { createSlice, configureStore } from "@reduxjs/toolkit";
import { ColorPicker } from "@functions";

export const defaultFontSize = 0.45;
export const areas = {
  tc: ["全齡健康展區", "年度主題館", "醫療機構展區", "智慧醫療展區", "精準醫療展區"],
  en: ["Consumer Health Products", "Featured Pavilions", "Medical Institutes & Hospitals", "Medical Devices & Equipment", "Diagnostics, Laboratory Equipment & Services"],
};
export const defaultMapText = {
  categories: {
    tc: [...areas.tc, "活動進行中"],
    en: [...areas.en, "Event in progress"],
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
  numOfBooths: { tc: "攤位數", en: "Booths" },
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
      dragStatus: { moving: false, distance: 0 },
    },
    mapText: {},
    floorData: { loaded: false, data: [], filterData: [] },
    types: ["booth", "room"],
    tooltip: { width: 200, margin: 20 },
    editForm: {},
  },
  reducers: {
    setData: (state, { payload: { data } }) => {
      state.floorData.data = data.map((d, i) => {
        let eventTime = [],
          textFormat = { tc: [], en: [] },
          textString = { tc: "", en: "" },
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
        return { ...d, id: d.id || `${d.type}-${d.floor}-${i}`, floor: d.floor.toString(), cat: d.cat || textString, topic: d.topic || textString, tag: tags, text: d.text || textFormat, size: d.size || { tc: defaultFontSize, en: defaultFontSize }, event: eventTime, corps: d.corps ? d.corps.map((corp, i) => ({ ...corp, corpId: `${corp._id}-${i}` || `${d.id}-${i}` })) : [] };
      });
      state.floorData.loaded = true;
    },
    setFloorData: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state.floorData[key] = payload[key];
      });
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
    setElementStatus: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state.elementStatus[key] = payload[key];
      });
    },
    setDragStatus: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state.elementStatus.dragStatus[key] = payload[key];
      });
    },
    setTooltip: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state.tooltip[key] = payload[key];
      });
    },
    setEditForm: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state.editForm[key] = payload[key];
      });
    },
    setStore: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        state[key] = payload[key];
      });
    },
  },
});

const store = configureStore({
  reducer: counterSlice.reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
export const actions = counterSlice.actions;
