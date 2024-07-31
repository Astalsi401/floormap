import { useDispatch, useSelector } from "react-redux";
import { setSearchCondition } from "@store";
import { zoomCalculator, resetViewbox } from "@functions";

export const Selector = ({ graphRef, svgRef, animation }) => {
  const dispatch = useDispatch();
  const searchCondition = useSelector((state) => state.searchCondition);
  const handleClickZoom = (r) => {
    animation();
    const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = graphRef.current;
    zoomCalculator(x + w / 2, y + h / 2, graphRef.current, svgRef.current, r);
  };
  return (
    <>
      <div className="fp-select-floor shadow" onChange={({ target: { name, value } }) => dispatch(setSearchCondition({ [name]: value }))}>
        {["4", "1"].map((d) => (
          <label key={`floor-${d}`}>
            <input type="radio" name="floor" value={d} checked={searchCondition.floor === d} onChange={({ target: { name, value } }) => dispatch(setSearchCondition({ [name]: value }))} />
            <span className="d-flex justify-content-center align-items-center text-small">{d}F</span>
          </label>
        ))}
      </div>
      <div className="fp-select-lang shadow">
        <label>
          <input type="checkbox" name="lang" value={searchCondition.lang === "tc" ? "en" : "tc"} checked={searchCondition.lang === "tc"} onChange={() => dispatch(setSearchCondition({ lang: searchCondition.lang === "tc" ? "en" : "tc", string: "", tag: "" }))} />
          <span className="d-flex justify-content-center align-items-center text-small">{searchCondition.lang === "tc" ? "EN" : "中"}</span>
        </label>
      </div>
      <div className="fp-zoom">
        <span className="d-flex justify-content-center align-items-center text-xx-large shadow" onClick={() => handleClickZoom(1.3)}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V18M6 12H18" stroke="black" strokeWidth="2" />
          </svg>
        </span>
        <span
          className="d-flex justify-content-center align-items-center text-xx-large shadow"
          onClick={() => {
            animation();
            resetViewbox(svgRef);
          }}
        >
          <svg width="26" height="26" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0,512) scale(0.1,-0.1)" fill="#000000" stroke="none">
              <path d="M555 4673 c-44 -23 -84 -63 -106 -105 -18 -35 -19 -64 -19 -513 0 -407 2 -481 15 -513 64 -152 273 -172 370 -34 l30 44 3 206 3 206 577 -576 c317 -317 591 -583 608 -592 87 -43 175 -28 245 43 71 70 86 158 43 245 -9 17 -275 291 -592 608 l-576 577 206 3 206 3 44 30 c138 97 118 306 -34 370 -56 23 -978 22 -1023 -2z" />
              <path d="M3540 4674 c-167 -72 -165 -318 2 -389 29 -12 79 -15 230 -15 l193 0 -577 -577 c-317 -318 -583 -592 -592 -609 -43 -87 -28 -175 43 -245 70 -71 158 -86 245 -43 17 9 291 275 609 592 l577 577 0 -193 c0 -151 3 -201 15 -230 64 -152 273 -172 370 -34 l30 44 3 489 c2 437 1 492 -14 521 -23 46 -63 87 -106 109 -35 18 -64 19 -515 19 -404 -1 -483 -3 -513 -16z" />
              <path d="M2065 2335 c-22 -8 -42 -15 -45 -15 -2 0 -267 -262 -587 -582 l-583 -583 0 193 c0 151 -3 201 -15 230 -71 169 -319 169 -390 0 -13 -32 -15 -106 -15 -513 0 -418 2 -480 16 -508 23 -45 63 -86 107 -108 36 -19 59 -19 526 -17 l489 3 44 30 c138 97 118 306 -34 370 -29 12 -79 15 -230 15 l-193 0 577 578 c317 317 583 591 591 607 42 84 25 184 -40 246 -21 20 -47 41 -59 47 -38 20 -117 23 -159 7z" />
              <path d="M2915 2336 c-54 -20 -121 -92 -135 -147 -13 -48 -7 -106 16 -153 9 -17 275 -291 592 -608 l577 -578 -193 0 c-151 0 -201 -3 -230 -15 -169 -71 -169 -319 0 -390 32 -13 106 -15 513 -15 449 0 478 1 513 19 43 22 83 63 106 108 14 28 16 90 16 508 0 407 -2 481 -15 513 -71 169 -319 169 -390 0 -12 -29 -15 -79 -15 -230 l0 -193 -577 577 c-318 317 -593 584 -611 593 -47 23 -120 28 -167 11z" />
            </g>
          </svg>
        </span>
        <span className="d-flex justify-content-center align-items-center text-xx-large shadow" onClick={() => handleClickZoom(0.7)}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12H18" stroke="black" strokeWidth="2" />
          </svg>
        </span>
      </div>
    </>
  );
};
