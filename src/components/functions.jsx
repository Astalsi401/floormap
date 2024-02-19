import { defer } from "react-router-dom";

export class ColorPicker {
  constructor(colors_, categories_, unknow_) {
    this.colors_ = colors_;
    this.categories_ = categories_;
    this.unknow_ = unknow_;
  }
  colors = (colors_) => {
    this.colors_ = colors_;
    return this;
  };
  categories = (categories_) => {
    this.categories_ = categories_;
    return this;
  };
  unknow = (unknow_) => {
    this.unknow_ = unknow_;
    return this;
  };
  scale = (category) => {
    const i = this.categories_.indexOf(category);
    return this.colors_[i] || this.unknow_;
  };
}

export const getMapElems = async ({ params: { year, category } }) => {
  console.log("run getMapElems()");
  const data = Promise.all([fetch(`${import.meta.env.BASE_URL}/assets/json/${year}/${category}.json`).then((res) => res.json()), fetch(`${import.meta.env.BASE_URL}/assets/json/elems.json`).then((res) => res.json())]).then((res) => res.flat());
  return defer({ data });
};
