import { signal, effect, computed } from "@preact/signals-react";
import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useLoaderData, Await, useAsyncValue } from "react-router-dom";
import { searchCondition, elementState, mapText } from "@signals";
import { Header, Sidebar, Floormap } from "@components";

const handleResize = () => {
  setTimeout(() => {
    const smallScreen = window.innerWidth < 768;
    const sidebar = elementState.value.load ? (smallScreen ? elementState.value.sidebar : !smallScreen) : smallScreen ? false : true;
    const { innerWidth: width, innerHeight: height } = window;
    const sidebarWidth = smallScreen ? (sidebar ? height * 0.6 : height - 117) : sidebar ? 300 : 30;
    const tagsHeight = smallScreen ? 100 : 80;
    elementState.value = { ...elementState.value, width: smallScreen ? width : width - sidebarWidth, height: height - elementState.value.tagsHeight, load: true, smallScreen: smallScreen, sidebar: sidebar, sidebarWidth: sidebarWidth, tagsHeight: tagsHeight };
  }, 50);
};

export const Home = () => {
  useEffect(() => {
    window.addEventListener("resize", handleResize);
  }, []);
  return <>{elementState.value.width}</>;
};
