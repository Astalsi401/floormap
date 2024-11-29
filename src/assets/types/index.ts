import { ColorPicker } from "@functions";

export type Get = "GET";
export type Post = "POST";
export type Put = "PUT";
export type Delete = "DELETE";
export type Method = Get | Post | Put | Delete;
export type Types = "wall" | "pillar" | "room" | "icon" | "booth" | "text";

export type DefaultText = { tc: string; en: string; [key: string]: string };
export type DefaultTags = { tc: string[]; en: string[]; [key: string]: string[] };
export type DefaultNumber = { tc: number; en: number; [key: string]: number };
export type PathType = { node: "L" | "C"; x: number; y: number; x1?: number; y1?: number; x2?: number; y2?: number };
export type BoothPos = { floor: number; w: number; h: number; x: number; y: number; id: string; type: Types };

type DataBasic = { id: string; floor: string; x: number; y: number; type: Types; p: PathType[] };
export type ResCorp = { _id: string; org: DefaultText; info: DefaultText };
export type ResEvent = { _id: string; timeList: { _id: string; start: string; end: string }[]; title: DefaultText; topic: DefaultText };
export type ResBooth = DataBasic & {
  w: number;
  h: number;
  booths: string[];
  size: DefaultNumber;
  cat: DefaultText;
  topic: DefaultText;
  tag: DefaultTags;
  text: DefaultText;
  corps: ResCorp[];
  event: ResEvent[];
  shift?: { x: number; y: number };
};
export type ResWall = DataBasic & { fill: string; strokeWidth: number };
export type ResPillar = DataBasic & { w: number; h: number };
export type ResRoom = DataBasic & { w: number; h: number; text: DefaultText; size: DefaultNumber; strokeWidth: number; icon: string };
export type ResText = DataBasic & { text: DefaultText; size: DefaultNumber; color: string };
export type ResData = ResBooth | ResWall | ResPillar | ResRoom | ResText;

export type OriginalCorp = { _id: string; corpId: string; org: DefaultText; info: DefaultText };
export type OriginalEvent = { _id: string; timeList: { start: Date; end: Date }[]; title: DefaultText; topic: DefaultText; active: boolean };
type OriginalBasic = DataBasic & {
  size: DefaultNumber;
  cat: DefaultText;
  topic: DefaultText;
  tag: DefaultTags;
  text: DefaultText;
  corps: OriginalCorp[];
  event: OriginalEvent[];
};
export type OriginalBooth = OriginalBasic & { w: number; h: number; booths: string[]; shift?: { x: number; y: number } };
export type OriginalWall = OriginalBasic & { fill: string; strokeWidth: number };
export type OriginalPillar = OriginalBasic & { w: number; h: number };
export type OriginalRoom = OriginalBasic & { w: number; h: number; strokeWidth: number; icon: string };
export type OriginalText = OriginalBasic & { color: string };
export type OriginalData = OriginalBooth | OriginalWall | OriginalPillar | OriginalRoom | OriginalText;

export type FilterCorp = { org: string; info: string; _id: string; corpId: string };
export type FilterEvent = { _id: string; timeList: { start: Date; end: Date }[]; title: string; topic: string; active: boolean };
type FilterBasic = {
  id: string;
  floor: string;
  x: number;
  y: number;
  type: Types;
  size: number;
  cat: string;
  topic: string;
  tag: string[];
  text: string;
  corps: FilterCorp[];
  event: FilterEvent[];
  p: PathType[];
  opacity: number;
  draw: boolean;
  sidebar: boolean;
};
export type FilterBooth = FilterBasic & { w: number; h: number; booths: string[]; org: string; info: string; _id: string; corpId: string; shift?: { x: number; y: number } };
export type FilterWall = FilterBasic & { fill: string; strokeWidth: number };
export type FilterPillar = FilterBasic & { w: number; h: number };
export type FilterRoom = FilterBasic & { w: number; h: number; strokeWidth: number; icon: string; booths?: string[]; org?: string; info?: string; _id?: string; corpId?: string };
export type FilterText = FilterBasic & { color: string };
export type FilterData = FilterBooth | FilterWall | FilterPillar | FilterRoom | FilterText;

export type MapText = { categories: DefaultTags; link: DefaultText; title: DefaultText; event: DefaultText; header: DefaultText; headerTags: DefaultTags; download: DefaultText; searchPlaceholder: DefaultText; remove: DefaultText; clear: DefaultText; exhibitor: DefaultText; activity: DefaultText; numOfBooths: DefaultText; [key: string]: DefaultText | DefaultTags };
export type MapTextLang = { [key in keyof MapText]?: MapText[key]["tc" | "en"] };
export type SearchCondition = { string: string; regex: RegExp; tag: string; floor: string; lang: string };
export type DragStatus = { moving: boolean; distance: number };
export type ElementStatus = {
  load: boolean;
  isMobile: boolean;
  width: number;
  height: number;
  colors: ColorPicker;
  boothInfoData: FilterBooth | FilterRoom;
  smallScreen: boolean;
  sidebar: boolean;
  advanced: boolean;
  boothInfo: boolean;
  login: boolean;
  realSize: { w: number; h: number };
  tagsHeight: number;
  sidebarWidth: number;
  dragStatus: DragStatus;
};
export type EditForm = {
  id: string;
  booths: string[];
  text: DefaultText;
  cat: DefaultText;
  topic: DefaultText;
  corps: OriginalCorp[];
  size: DefaultNumber;
  tag: DefaultTags;
  [key: string]: string | string[] | DefaultText | DefaultNumber | DefaultTags | OriginalCorp[];
};
export type FloorData = { loaded: boolean; saving: boolean; data: OriginalData[]; filterData: FilterData[]; [key: string]: OriginalData[] | FilterData[] | boolean };
export type MapState = {
  searchCondition: SearchCondition;
  elementStatus: ElementStatus;
  mapText: MapTextLang;
  floorData: FloorData;
  types: string[];
  tooltip: { width: number; margin: number; id: string; cat: string; text: string; x: number; y: number; active: boolean };
  editForm: EditForm;
};

export type GetMapElemsResponse = { data: ResData[]; login: boolean };
