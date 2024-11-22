import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ContentEditable from "react-contenteditable";
import store, { setFloorData, setElementStatus, setEditForm, saveEditForm, areas, defaultString, defaultFontSize, METHOD } from "@store";
import { BtnLoading } from "@components";

const textToHTML = (string) => {
  let res = string.replace(/\n$/, "<br>").split("\n");
  return res.length > 1 ? res.map((d) => (d === "" ? "" : `<div>${d}</div>`)).join("") : res[0];
};
const htmlToText = (string) =>
  string
    .replace(/^<div>|<\/div>$/g, "")
    .replace(/<\/div><div>|<br>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .trim();
const getCurrentText = ({ name, lang, corpId }) => (corpId ? store.getState()?.editForm.corps.find((d) => d.corpId === corpId)?.[name]?.[lang] : store.getState()?.editForm?.[name]?.[lang]);
const updateText = ({ name, lang, corpId, content }) => (corpId ? { corps: store.getState().editForm.corps.map((d) => (d.corpId === corpId ? { ...d, [name]: { ...d[name], [lang]: htmlToText(content.current[lang]) } } : d)) } : { [name]: { ...store.getState().editForm?.[name], [lang]: htmlToText(content.current[lang]) } });

export const BoothText = ({ className, name, value, placeholder, corpId }) => {
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.searchCondition.lang);
  const content = useRef({ [lang]: textToHTML(value || "") });
  content.current[lang] = textToHTML(getCurrentText({ name, lang, corpId }) ?? value ?? ""); // 確保語言切換重新渲染後優先使用已編輯但未儲存的文字
  const handleChange = (e) => {
    content.current[lang] = e.target.value === "<br>" ? "" : e.target.value;
    dispatch(setEditForm(updateText({ name, lang, corpId, content })));
  };
  return (
    <div className={className}>
      <ContentEditable html={content.current[lang]} onChange={handleChange} data-placeholder={placeholder} />
    </div>
  );
};

export const FontSize = () => {
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.searchCondition.lang);
  const size = useSelector((state) => state.editForm.size)[lang];
  const handleChange = (e) => dispatch(setEditForm({ size: { ...store.getState().editForm.size, [lang]: Number(e.target.value) } }));
  return (
    <div className="fp-edit-fontsize p-2">
      字體大小: {size}
      <input className="d-block w-100" type="range" min={0.25} max={1} step={0.05} value={size} onChange={handleChange} />
    </div>
  );
};

export const SelectedBooths = ({ id }) => {
  const dispatch = useDispatch();
  const booths = useSelector((state) => state.editForm.booths);
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

export const SelectedCategory = () => {
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.searchCondition.lang);
  const colors = useSelector((state) => state.elementStatus.colors);
  const editCat = useSelector((state) => state.editForm.cat)[lang];
  const handleChange = ({ target: { value } }) => {
    const lang_ = lang === "tc" ? "en" : "tc";
    dispatch(setEditForm({ cat: { [lang]: value, [lang_]: areas[lang_][areas[lang].indexOf(value)] } }));
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

export const AddCorp = () => {
  const dispatch = useDispatch();
  const corps = useSelector((state) => state.editForm.corps);
  const handleClick = () => {
    const current = store.getState().editForm;
    dispatch(setEditForm({ corps: [...current.corps, { corpId: `${current.id}-add`, org: defaultString, info: defaultString }] }));
    dispatch(setElementStatus({ boothInfoData: { ...store.getState().elementStatus.boothInfoData, corpId: `${current.id}-add`, org: "", info: "" } }));
  };
  return (
    !corps.some((d) => d.corpId.endsWith("-add")) && (
      <div className="fp-input-tag shadow text-small" style={{ "--cat": "rgb(207, 97, 97)" }} onClick={handleClick}>
        +
      </div>
    )
  );
};

export const SaveBtn = ({ id, meth, className }) => {
  const dispatch = useDispatch();
  const { regex, tag, lang } = useSelector((state) => state.searchCondition);
  const saving = useSelector((state) => state.floorData.saving);
  const { year, category } = useParams();
  const handleSave = () => {
    if (saving) return;
    dispatch(setFloorData({ saving: true }));
    if (meth === METHOD.DELETE) dispatch(setEditForm({ booths: [id], size: { tc: defaultFontSize, en: defaultFontSize }, cat: defaultString, topic: defaultString, tag: { tc: [], en: [] }, text: defaultString, corps: [], event: [], p: [] }));
    saveEditForm({ year, category, id, tag, lang, regex, meth })(dispatch);
  };
  return <BtnLoading className={className} loading={saving} onClick={handleSave} text={{ POST: "儲存", DELETE: "刪除" }[meth]} />;
};

export const ResetBtn = ({ id }) => {
  const dispatch = useDispatch();
  const handleReset = () => dispatch(setEditForm({ booths: [id], size: { tc: defaultFontSize, en: defaultFontSize }, cat: defaultString, topic: defaultString, tag: { tc: [], en: [] }, text: defaultString, corps: [], event: [], p: [] }));
  return <BtnLoading loading={false} onClick={handleReset} text="重設" />;
};
