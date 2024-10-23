import store, { actions, defaultMapText, defaultFontSize, areas } from "./store";
import { ColorPicker, getMapElems, getFilterData } from "@functions";

export default store;
export { defaultMapText, defaultFontSize, areas };
export const { setFloorData, setSearchCondition, setElementStatus, setDragStatus, setStore, setTooltip, setEditForm } = actions;

const mapTextLangChange = (lang) => Object.keys(defaultMapText).reduce((acc, key) => ({ ...acc, [key]: defaultMapText[key][lang] }), {});
const hasActiveEvent = (time) => {
  const now = new Date();
  const start = new Date(time.start);
  const end = new Date(time.end);
  const nowDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const startDate = new Date(`${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()} 00:00:00`);
  const endDate = new Date(`${end.getFullYear()}-${end.getMonth() + 1}-${end.getDate()} 23:59:59`);
  const startTime = new Date(`${nowDate} ${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}`);
  const endTime = new Date(`${nowDate} ${end.getHours()}:${end.getMinutes()}:${end.getSeconds()}`);
  return startDate < now && now < endDate && startTime < now && now < endTime && (event.title.tc.length > 0 || event.title.en.length > 0);
};
const eventFormat = (event) => ({ ...event, timeList: event.timeList.map((time) => ({ start: new Date(time.start), end: new Date(time.end) })), active: event.timeList.some(hasActiveEvent) });
export const dataFormat =
  ({ data }) =>
  (dispatch) => {
    dispatch(
      setFloorData({
        data: data.map((d, i) => {
          let eventTime = [],
            textString = { tc: "", en: "" },
            tags = d.tag ? d.tag : { tc: [], en: [] };
          if (d.event) {
            eventTime = d.event.map(eventFormat);
            tags = eventTime.some((e) => e.active) ? { tc: [...tags.tc, mapText.event.tc], en: [...tags.en, mapText.event.en] } : tags;
          }
          return { ...d, id: d.id || `${d.type}-${d.floor}-${i}`, floor: d.floor.toString(), cat: d.cat || textString, topic: d.topic || textString, tag: tags, text: d.text || textString, size: d.size || { tc: defaultFontSize, en: defaultFontSize }, event: eventTime, corps: d.corps ? d.corps.map((corp, i) => ({ ...corp, corpId: `${d.id}-${i}` })) : [] };
        }),
        loaded: true,
        saving: false,
      })
    );
  };

export const pageLoadAsync = () => (dispatch) => {
  const { string, regex, tag, floor, lang } = store.getState().searchCondition;
  const params = new URLSearchParams(window.location.search);
  dispatch(setSearchCondition({ string: params.get("string") || string, regex: params.get("regex") || regex, tag: params.get("tag") || tag, floor: params.get("floor") || floor, lang: params.get("lang") || (/^zh/i.test(navigator.language) ? "tc" : "en") }));
  dispatch(setStore({ mapText: mapTextLangChange(lang) }));
  dispatch(setElementStatus({ isMobile: /windows phone|android|iPad|iPhone|iPod/i.test(navigator.userAgent || window.opera), height: window.innerHeight - store.getState().elementStatus.tagsHeight, colors: new ColorPicker(["rgba(237,125,49,0.6)", "rgba(153,204,255,1)", "rgba(255,255,0,0.6)", "rgba(0,112,192,0.6)", "rgba(112,48,160,0.6)", "rgb(128, 0, 75, 0.2)"], store.getState().mapText.categories, "rgba(255,255,255)") }));
};
export const resizeAsync = () => (dispatch) => {
  const elementStatus = store.getState().elementStatus;
  const smallScreen = window.innerWidth < 768;
  const sidebar = elementStatus.load ? (smallScreen ? elementStatus.sidebar : !smallScreen) : smallScreen ? false : true;
  const { innerHeight, innerWidth } = window;
  const sidebarWidth = smallScreen ? (sidebar ? innerHeight * 0.6 : innerHeight - 117) : sidebar ? 300 : 30;
  const tagsHeight = smallScreen ? 100 : 80;
  setTimeout(() => dispatch(setElementStatus({ width: innerWidth - (smallScreen ? 0 : sidebarWidth), height: innerHeight - elementStatus.tagsHeight, load: true, smallScreen, sidebar, sidebarWidth, tagsHeight })), 50);
};

export const searchChangeAsync =
  ({ filterData }) =>
  (dispatch) => {
    const { lang } = store.getState().searchCondition;
    const { boothInfoData, colors } = store.getState().elementStatus;
    dispatch(setFloorData({ filterData }));
    dispatch(setStore({ mapText: mapTextLangChange(lang) }));
    dispatch(setElementStatus({ boothInfoData: Object.keys(boothInfoData).length === 0 ? {} : filterData.find((d) => d.id === boothInfoData.id && d.corpId === boothInfoData.corpId), colors: colors.categories(store.getState().mapText.categories) }));
    document.title = store.getState().mapText.title;
  };

export const regexAsync = () => async (dispatch) => {
  new Promise((resolve) => setTimeout(resolve, 50));
  dispatch(setSearchCondition({ regex: "update" }));
};
export const initEditForm =
  ({ id }) =>
  (dispatch) => {
    const { booths, text, cat, corps, size } = store.getState().floorData.data.find((d) => d.id === id);
    dispatch(setEditForm({ booths: booths?.length > 0 ? booths : [id], text, cat, corps, size }));
  };
export const saveEditForm =
  ({ year, category, id, tag, lang, regex }) =>
  async (dispatch) => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/api/update/${category}/${year}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(store.getState().editForm),
    });
    const {
      data: { data },
    } = await getMapElems({ params: { year, category } });
    dataFormat({ data: await data })(dispatch);
    searchChangeAsync({ filterData: getFilterData({ data: store.getState().floorData.data, tag, lang, regex }) })(dispatch);
  };
