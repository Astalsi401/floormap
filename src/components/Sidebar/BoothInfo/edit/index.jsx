import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ContentEditable from "react-contenteditable";
import store, { setEditForm, saveEditForm, areas } from "@store";

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
  const types = useSelector((state) => state.types);
  const { year, category } = useParams();
  return (
    <div className="fp-selected-save p-2">
      <button className="fp-btn" onClick={() => saveEditForm({ year, category, id, types, tag, lang, regex })(dispatch)}>
        save
      </button>
    </div>
  );
};

export const BoothName = ({ className, name, value, placeholder }) => {
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.searchCondition.lang);
  const content = useRef({ [lang]: (value || []).map((d) => `<div>${d}</div>`).join("") });
  const handleChange = (e) => {
    content.current[lang] = e.target.value;
    dispatch(
      setEditForm({
        [name]: {
          ...store.getState().editForm?.[name],
          [lang]: content.current[lang]
            .replace(/^<div>|<br>|<\/div>$/g, "")
            .split("</div><div>")
            .filter((d) => d.length > 0),
        },
      })
    );
  };
  const current = store.getState()?.editForm?.[name]?.[lang] || value || [];
  content.current[lang] = current.map((d) => `<div>${d}</div>`).join("");
  return <ContentEditable className={className} html={content.current[lang]} onChange={handleChange} data-placeholder={placeholder} />;
};

const EditIcon = () => (
  <svg className="edit-icon mx-1" fill="none" viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
