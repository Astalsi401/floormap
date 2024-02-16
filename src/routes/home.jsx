import { signal, effect, computed } from "@preact/signals-react";
import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useLoaderData, Await, useAsyncValue } from "react-router-dom";
import { searchCondition, elementState, mapText } from "../assets/signals";
import { Loading } from "./../components/loading";
import { Header } from "./../components/header";
import { Sidebar } from "../components/sidebar";

const handleResize = () => {
  setTimeout(() => {
    const smallScreen = window.innerWidth < 768;
    const sidebar = elementState.value.load ? (smallScreen ? elementState.value.sidebar : !smallScreen) : smallScreen ? false : true;
    const { innerWidth: width, innerHeight: height } = window;
    const sidebarWidth = smallScreen ? (sidebar ? height * 0.6 : height - 117) : sidebar ? 300 : 30;
    const tagsHeight = smallScreen ? 100 : 80;
    console.log(smallScreen ? width : width - sidebarWidth);
    elementState.value = { ...elementState.value, width: smallScreen ? width : width - sidebarWidth, height: height - elementState.value.tagsHeight, load: true, smallScreen: smallScreen, sidebar: sidebar, sidebarWidth: sidebarWidth, tagsHeight: tagsHeight };
  }, 50);
};

export default function Home() {
  useEffect(() => {
    window.addEventListener("resize", handleResize);
  }, []);
  return <>{elementState.value.width}</>;
}
