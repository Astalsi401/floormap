import { useRef } from "react";
import { useParams } from "react-router-dom";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import store, { setFloorData, setElementStatus, setEditForm, saveEditForm, areas, defaultString, defaultFontSize, defaultTags, METHOD, useAppDispatch, useAppSelector } from "@store";
import { BtnLoading } from "@components";
import type { DefaultText, Delete, OriginalCorp, Post } from "@types";

const textToHTML = (string: string) => {
  const res = string.replace(/\n$/, "<br>").split("\n");
  return res.length > 1 ? res.map((d) => (d === "" ? "" : `<div>${d}</div>`)).join("") : res[0];
};
const htmlToText = (string: string) => {
  const res = string
    .replace(/^<div>|<\/div>$/g, "")
    .replace(/<\/div><div>|<br>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n+\s*$/g, "")
    .replace(/\n+/g, "\n");
  return res;
};
const getCurrentText = ({ name, lang, corpId }: { name: "org" | "info" | "text"; lang: string; corpId?: string }) => (corpId ? (store.getState().editForm.corps || []).find((d) => d.corpId === corpId)?.[name as "org" | "info"]?.[lang] : store.getState().editForm?.[name as "text"]?.[lang]);
const updateText = ({ name, lang, corpId, content }: { name: "org" | "info" | "text"; lang: string; corpId?: string; content: { current: { [lang: string]: string } } }): { corps?: OriginalCorp[]; text?: DefaultText } => (corpId ? { corps: (store.getState().editForm.corps || []).map((d) => (d.corpId === corpId ? { ...d, [name]: { ...d[name as "org" | "info"], [lang]: htmlToText(content.current[lang]) } } : d)) } : { [name]: { ...store.getState().editForm?.[name as "text"], [lang]: htmlToText(content.current[lang]) } });

export const BoothText: React.FC<{ className?: string; name: "org" | "info" | "text"; value?: string; placeholder?: string; corpId?: string }> = ({ className, name, value, placeholder, corpId }) => {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.searchCondition.lang);
  const content = useRef<{ [lang: string]: string }>({ [lang]: textToHTML(value || "") });
  content.current[lang] = textToHTML(getCurrentText({ name, lang, corpId }) ?? value ?? ""); // 確保語言切換重新渲染後優先使用已編輯但未儲存的文字
  const handleChange = (e: ContentEditableEvent) => {
    content.current[lang] = e.target.value === "<br>" ? "" : e.target.value;
    dispatch(setEditForm(updateText({ name, lang, corpId, content })));
  };
  return (
    <div className={className}>
      <ContentEditable html={content.current[lang]} onChange={handleChange} data-placeholder={placeholder} />
    </div>
  );
};

export const FontSize: React.FC = () => {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.searchCondition.lang);
  const size = useAppSelector((state) => state.editForm.size)?.[lang] || defaultFontSize;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => dispatch(setEditForm({ size: { ...store.getState().editForm.size, [lang]: Number(e.target.value) } }));
  return (
    <div className="fp-edit-fontsize p-2">
      字體大小: {size}
      <input className="d-block w-100" type="range" min={0.05} max={1} step={0.05} value={size} onChange={handleChange} />
    </div>
  );
};

export const SelectedBooths: React.FC<{ id: string }> = ({ id }) => {
  const dispatch = useAppDispatch();
  const booths = useAppSelector((state) => state.editForm.booths);
  const reset = () => dispatch(setEditForm({ booths: [id] }));
  return (
    <div className="fp-selected-booths p-2">
      <div className="">
        選擇攤位
        <button className="fp-btn mx-2 shadow" onClick={reset}>
          重設攤位
        </button>
      </div>
      <div className="fp-booth-tags d-flex flex-wrap py-2">
        {booths?.map((boothID) => (
          <div key={`selected-booth-${boothID}`} className="fp-input-tag shadow text-small">
            {boothID}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SelectedCategory: React.FC = () => {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.searchCondition.lang);
  const colors = useAppSelector((state) => state.elementStatus.colors);
  const editCat = useAppSelector((state) => state.editForm.cat)[lang];
  const handleChange = ({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) => {
    const lang_ = lang === "tc" ? "en" : "tc";
    dispatch(setEditForm({ cat: { [lang]: value, [lang_]: areas[lang_][areas[lang].indexOf(value)] } as DefaultText }));
  };
  return (
    <div className="fp-selected-category p-2">
      選擇展區
      <select className="d-block w-100 py-1 px-2 shadow-inset" style={{ background: colors.scale(editCat) }} onChange={handleChange} value={editCat || ""}>
        {["", ...areas[lang]].map((d) => (
          <option key={`selected-category-${d}`} value={d} style={{ background: colors.scale(d) }}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
};

export const AddCorp: React.FC = () => {
  const dispatch = useAppDispatch();
  const corps = useAppSelector((state) => state.editForm.corps);
  const handleClick = () => {
    const current = store.getState().editForm;
    dispatch(setEditForm({ corps: [...current.corps, { _id: `${current._id}-add`, corpId: `${current.id}-add`, org: defaultString, info: defaultString }] }));
    dispatch(setElementStatus({ boothInfoData: { ...store.getState().elementStatus.boothInfoData, corpId: `${current.id}-add`, org: "", info: "" } }));
  };
  return (
    !corps.some((d) => d.corpId.endsWith("-add")) && (
      <button className="fp-input-tag shadow text-small add-corp" style={{ "--cat": "rgb(207, 97, 97)" } as React.CSSProperties} onClick={handleClick}>
        +
      </button>
    )
  );
};

export const SaveBtn: React.FC<{ id: string; meth: Post | Delete; className?: string }> = ({ id, meth, className }) => {
  const dispatch = useAppDispatch();
  const { regex, tag, lang } = useAppSelector((state) => state.searchCondition);
  const saving = useAppSelector((state) => state.floorData.saving);
  const { year, category } = useParams() as { year: string; category: string };
  const handleSave = () => {
    if (saving) return;
    dispatch(setFloorData({ saving: true }));
    if (meth === METHOD.DELETE) dispatch(setEditForm({ booths: [id], size: { tc: defaultFontSize, en: defaultFontSize }, cat: defaultString, topic: defaultString, tag: defaultTags, text: defaultString, corps: [], event: [], p: [] }));
    saveEditForm({ year, category, id, tag, lang, regex, meth })(dispatch);
  };
  return <BtnLoading className={className} loading={saving} onClick={handleSave} text={{ POST: "儲存", DELETE: "刪除" }[meth]} />;
};

export const ResetBtn: React.FC<{ id: string }> = ({ id }) => {
  const dispatch = useAppDispatch();
  const handleReset = () => dispatch(setEditForm({ booths: [id], size: { tc: defaultFontSize, en: defaultFontSize }, cat: defaultString, topic: defaultString, tag: defaultTags, text: defaultString, corps: [], event: [], p: [] }));
  return <BtnLoading loading={false} onClick={handleReset} text="重設" />;
};
