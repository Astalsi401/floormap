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
      width: 0,
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
    setFloorData: (state, { payload }) => Object.entries(payload).forEach(([k, v]) => (state.floorData[k] = v)),
    setSearchCondition: (state, { payload }) =>
      Object.entries(payload).forEach(([k, v]) => {
        switch (k) {
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
            state.searchCondition[k] = v;
        }
      }),
    setElementStatus: (state, { payload }) => Object.entries(payload).forEach(([k, v]) => (state.elementStatus[k] = v)),
    setDragStatus: (state, { payload }) => Object.entries(payload).forEach(([k, v]) => (state.elementStatus.dragStatus[k] = v)),
    setTooltip: (state, { payload }) => Object.entries(payload).forEach(([k, v]) => (state.tooltip[k] = v)),
    setEditForm: (state, { payload }) => Object.entries(payload).forEach(([k, v]) => (state.editForm[k] = v)),
    setStore: (state, { payload }) => Object.entries(payload).forEach(([k, v]) => (state[k] = v)),
  },
});

const store = configureStore({
  reducer: counterSlice.reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
export const actions = counterSlice.actions;
