import { useSelector, useDispatch } from "react-redux";
import { toggleElement, setSearchCondition } from "@store";

export const Advanced = () => {
  const advanced = useSelector((state) => state.elementStatus.advanced);
  return (
    <div className={`fp-advanced py-5 ${advanced ? "active" : ""}`}>
      {[
        { title: "展區", col: "cat" },
        { title: "主題", col: "topic" },
      ].map((d) => (
        <Category key={d.title} title={d.title} col={d.col} />
      ))}
    </div>
  );
};

const Category = ({ title, col }) => {
  const dispatch = useDispatch();
  const types = useSelector((state) => state.types);
  const data = useSelector((state) => state.floorData.filterData).filter((d) => types.includes(d.type));
  const sum = data.reduce((acc, d) => {
    const key = d[col];
    acc[key] ? acc[key]++ : (acc[key] = 1);
    return acc;
  }, {});
  return (
    <div className="py-3 my-3">
      <div className="text-x-large text-bold px-2">{title}</div>
      {Object.keys(sum)
        .filter((d) => !["false", ""].includes(d))
        .map((d) => (
          <div
            key={`${title}-${d}`}
            className="fp-category px-4 py-1"
            onClick={() => {
              dispatch(setSearchCondition({ tag: d }));
              dispatch(toggleElement({ name: "advanced" }));
            }}
          >
            {d} ({sum[d]})
          </div>
        ))}
    </div>
  );
};
