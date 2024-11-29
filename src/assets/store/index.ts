import { useDispatch, useSelector } from "react-redux";
import store, { actions, defaultMapText, defaultFontSize, defaultString, defaultTags, METHOD, areas, defaultBoothInfoData } from "./store";
import { ColorPicker, getMapElems, getFilterData } from "@functions";
import type { Delete, FilterBooth, FilterData, MapTextLang, OriginalBooth, Post, ResBooth, ResData, ResEvent, ResRoom } from "@types";

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export default store;
export { defaultMapText, defaultFontSize, defaultString, defaultTags, defaultBoothInfoData, METHOD, areas };
export const { setFloorData, setSearchCondition, setElementStatus, setDragStatus, setStore, setTooltip, setEditForm } = actions;

const mapTextLangChange = (lang: string): MapTextLang => Object.keys(defaultMapText).reduce((acc, key) => ({ ...acc, [key]: defaultMapText[key][lang] }), {});
const hasActiveEvent = ({ event, time }: { event: ResEvent; time: { start: string; end: string } }): boolean => {
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
const eventFormat = (event: ResEvent) => ({ ...event, timeList: event.timeList.map((time) => ({ start: new Date(time.start), end: new Date(time.end) })), active: event.timeList.some((time) => hasActiveEvent({ event, time })) });
export const dataFormat =
  ({ data }: { data: ResData[] }) =>
  (dispatch: AppDispatch) => {
    dispatch(
      setFloorData({
        data: data.map((d, i) => {
          const eventTime = (d as ResBooth)?.event?.map(eventFormat) || [];
          let tags = (d as ResBooth)?.tag || { tc: [], en: [] };
          if ((d as ResBooth)?.event) tags = eventTime.some((e) => e.active) ? { tc: [...tags.tc, defaultMapText.event.tc], en: [...tags.en, defaultMapText.event.en] } : tags;
          return { ...d, id: d.id || `${d.type}-${d.floor}-${i}`, floor: d.floor.toString(), cat: (d as ResBooth)?.cat || defaultString, topic: (d as ResBooth)?.topic || defaultString, tag: tags, text: (d as ResBooth | ResRoom)?.text || defaultString, size: (d as ResBooth | ResRoom)?.size || { tc: defaultFontSize, en: defaultFontSize }, event: eventTime, corps: (d as ResBooth)?.corps ? (d as ResBooth)?.corps.map((corp, i) => ({ ...corp, corpId: `${d.id}-${i}` })) : [] };
        }),
        loaded: true,
        saving: false,
      })
    );
  };

export const pageLoadAsync = () => (dispatch: AppDispatch) => {
  const { string, tag, floor, lang } = store.getState().searchCondition;
  const params = new URLSearchParams(window.location.search);
  dispatch(setSearchCondition({ string: params.get("string") || string, tag: params.get("tag") || tag, floor: params.get("floor") || floor, lang: params.get("lang") || (/^zh/i.test(navigator.language) ? "tc" : "en") }));
  dispatch(setStore({ mapText: mapTextLangChange(lang) }));
  dispatch(setElementStatus({ isMobile: /windows phone|android|iPad|iPhone|iPod/i.test(navigator.userAgent), height: window.innerHeight - store.getState().elementStatus.tagsHeight, colors: new ColorPicker(["rgba(237,125,49,0.6)", "rgba(153,204,255,1)", "rgba(255,255,0,0.6)", "rgba(0,112,192,0.6)", "rgba(112,48,160,0.6)", "rgb(128, 0, 75, 0.2)"], store.getState().mapText.categories || [], "rgba(255,255,255)") }));
};
export const resizeAsync = () => (dispatch: AppDispatch) => {
  const elementStatus = store.getState().elementStatus;
  const smallScreen = window.innerWidth < 768;
  const sidebar = elementStatus.load ? (smallScreen ? elementStatus.sidebar : !smallScreen) : smallScreen ? false : true;
  const { innerHeight, innerWidth } = window;
  const sidebarWidth = smallScreen ? (sidebar ? innerHeight * 0.6 : innerHeight - 117) : sidebar ? 300 : 30;
  const tagsHeight = smallScreen ? 100 : 80;
  setTimeout(() => dispatch(setElementStatus({ width: innerWidth - (smallScreen ? 0 : sidebarWidth), height: innerHeight - elementStatus.tagsHeight, load: true, smallScreen, sidebar, sidebarWidth, tagsHeight })), 50);
};

export const searchChangeAsync =
  ({ filterData }: { filterData: FilterData[] }) =>
  (dispatch: AppDispatch) => {
    const { lang } = store.getState().searchCondition;
    const { boothInfoData, colors } = store.getState().elementStatus;
    dispatch(setFloorData({ filterData }));
    dispatch(setStore({ mapText: mapTextLangChange(lang) }));
    const currentBoothInfoData = filterData.find((d) => d.id === boothInfoData.id && (d as FilterBooth).corpId === boothInfoData.corpId) as FilterBooth;
    !boothInfoData?.corpId?.endsWith("-add") && dispatch(setElementStatus({ boothInfoData: !currentBoothInfoData ? defaultBoothInfoData : currentBoothInfoData, colors: colors.categories(store.getState().mapText.categories || []) }));
    document.title = store.getState().mapText.title || "";
  };

export const regexAsync = () => async (dispatch: AppDispatch) => {
  new Promise((resolve) => setTimeout(resolve, 50));
  dispatch(setSearchCondition({ regex: "update" }));
};
export const initEditForm =
  ({ id }: { id: string }) =>
  (dispatch: AppDispatch) => {
    const { booths, text, cat, corps, size } = store.getState().floorData.data.find((d) => d.id === id) as OriginalBooth;
    dispatch(setEditForm({ id, booths: booths?.length > 0 ? booths : [id], text, cat, corps, size }));
  };
export const saveEditForm =
  ({ year, category, id, tag, lang, regex, meth }: { year: string; category: string; id: string; tag: string; lang: string; regex: RegExp; meth: Post | Delete }) =>
  async (dispatch: AppDispatch) => {
    try {
      const { data } = getMapElems({ params: { year, category, id }, postData: store.getState().editForm, meth });
      const res: { data: ResData[]; login: boolean } = await data;
      dataFormat({ data: res.data })(dispatch);
      initEditForm({ id })(dispatch);
      searchChangeAsync({ filterData: getFilterData({ data: store.getState().floorData.data, tag, lang, regex }) })(dispatch);
    } catch (error) {
      console.error(error);
      dispatch(setFloorData({ saving: false }));
    }
  };
