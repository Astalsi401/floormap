import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import store, { setElementStatus, setSearchCondition, regexAsync, searchChangeAsync } from "@store";
import { getFilterData } from "@functions";

export const Search = () => {
  const dispatch = useDispatch();
  const { string, regex, tag, floor, lang } = useSelector((state) => state.searchCondition);
  const sidebar = useSelector((state) => state.elementStatus.sidebar);
  const advanced = useSelector((state) => state.elementStatus.advanced);
  const colors = useSelector((state) => state.elementStatus.colors);
  const mapText = useSelector((state) => state.mapText);
  const data = useSelector((state) => state.floorData.data);
  const searched = string.length === 0 && tag.length === 0;
  const [inputTimer, setInputTimer] = useState(null);
  const handleInput = ({ target: { name, value } }) => {
    clearTimeout(inputTimer);
    const timer = setTimeout(() => setInputTimer(null), 500);
    setInputTimer(timer);
    dispatch(setElementStatus({ advanced: false }));
    dispatch(setSearchCondition({ [name]: value }));
  };
  useEffect(() => {
    if (inputTimer) return;
    dispatch(regexAsync());
  }, [string, inputTimer]);
  useEffect(() => {
    searchChangeAsync({ filterData: getFilterData({ data, tag, lang, regex }) })(dispatch);
  }, [tag, floor, lang, regex]);
  useEffect(() => {
    const url = new URL(window.location.href);
    Object.keys({ string, tag, floor, lang }).forEach((key) => (eval(key).length === 0 ? url.searchParams.delete(key) : url.searchParams.set(key, eval(key))));
    history.pushState(null, "", url.href);
  }, [string, tag, floor, lang]);
  return (
    <div className="fp-search d-flex align-items-center justify-content-center">
      <div className={`fp-filter px-1 ${advanced ? "active" : ""}`} onClick={() => dispatch(setElementStatus({ advanced: !store.getState().elementStatus.advanced }))}>
        <FilterIcon />
      </div>
      <div className="fp-input d-flex flex-wrap align-items-center px-1">
        {tag.length !== 0 && (
          <div className="fp-input-tag shadow text-small" title={mapText.remove} onClick={() => dispatch(setSearchCondition({ tag: "" }))} style={{ "--cat": colors.scale(tag) }}>
            {tag}
          </div>
        )}
        <input className="fp-input-text d-block text-large" name="string" type="text" value={string} onChange={handleInput} placeholder={mapText.searchPlaceholder} />
      </div>
      <div className={`fp-toggle d-flex align-items-center justify-content-center ${searched ? "" : "active"}`} title={searched ? "" : mapText.clear} onClick={() => sidebar && dispatch(setSearchCondition({ string: "" }))}>
        <span />
      </div>
    </div>
  );
};

const FilterIcon = () => (
  <>
    <span />
    <svg width="100%" height="100%" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <defs>
        <path id="filter-bar" d="M0 0H350A20 20 90 1 1 350 40H0A20 20 90 1 1 0 0" />
      </defs>
      <use xlinkHref="#filter-bar" x={75} y={100} />
      <use xlinkHref="#filter-bar" x={75} y={230} />
      <use xlinkHref="#filter-bar" x={75} y={360} />
    </svg>
  </>
);
