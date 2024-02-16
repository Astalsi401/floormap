import { signal } from "@preact/signals-react";

const sidebar = signal(true);
const advanced = signal(false);

export { sidebar, advanced };
