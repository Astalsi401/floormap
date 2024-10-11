import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ContentEditable from "react-contenteditable";
import store, { setFloorData, setEditForm, saveEditForm, areas } from "@store";

export const SelectedBooths = () => {
  const dispatch = useDispatch();
  const booths = useSelector((state) => state.editForm.booths);
  const reset = () => dispatch(setEditForm({ booths: [] }));
  return (
    <div className="fp-selected-booths p-2">
      <div className="">選擇攤位</div>
      <button className="fp-btn" onClick={reset}>
        reset
      </button>
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

export const SelectedSave = ({ id }) => {
  const dispatch = useDispatch();
  const { regex, tag, lang } = useSelector((state) => state.searchCondition);
  const saving = useSelector((state) => state.floorData.saving);
  const { year, category } = useParams();
  const handleSave = () => {
    if (saving) return;
    dispatch(setFloorData({ saving: true }));
    saveEditForm({ year, category, id, tag, lang, regex })(dispatch);
  };
  return (
    <div className="fp-selected-save p-2">
      <div className={`fp-save-btn d-flex align-items-center justify-content-center mx-auto shadow text-bold ${saving ? "saving" : ""}`} onClick={handleSave}>
        save
        <span style={{ "--i": 0 }}></span>
        <span style={{ "--i": 1 }}></span>
        <span style={{ "--i": 2 }}></span>
        <span style={{ "--i": 3 }}></span>
      </div>
    </div>
  );
};

export const BoothName = ({ className, name, value, placeholder }) => {
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.searchCondition.lang);
  const content = useRef({
    [lang]: (value || "")
      .split("\n", "")
      .map((d) => `<div>${d}</div>`)
      .join(""),
  });
  const handleChange = (e) => {
    content.current[lang] = e.target.value;
    dispatch(
      setEditForm({
        [name]: {
          ...store.getState().editForm?.[name],
          [lang]: content.current[lang]
            .replace(/^<div>|<br>|<\/div>$/g, "")
            .split("</div><div>")
            .filter((d) => d.length > 0)
            .join("\n"),
        },
      })
    );
  };
  const current = store.getState()?.editForm?.[name]?.[lang] || value || [];
  content.current[lang] = current
    .split("\n")
    .map((d) => `<div>${d}</div>`)
    .join("");
  return <ContentEditable className={className} html={content.current[lang]} onChange={handleChange} data-placeholder={placeholder} />;
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