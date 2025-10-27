import SysTray, { ClickEvent } from "systray";
import * as path from "@std/path";
import { exportAll, exportSingleEntry } from "./exporter.ts";
import config from "./config.ts";
let watcher: Deno.FsWatcher | null = null;
const ItemRunNow = {
  title: "Run now",
  enabled: true,
  tooltip: "Run now",
};
const ItemExit = {
  title: "Exit",
  checked: false,
  enabled: true,
  tooltip: "Exit",
};

const systray = new SysTray({
  menu: {
    tooltip: "Steam Clip Auto Exporter",
    icon: Deno.build.os === "windows" ? "./icon.ico" : "./icon.png",
    isTemplateIcon: Deno.build.os === "darwin",
    title: "Steam Clip Auto Exporter",
    items: [
      ItemRunNow,
      SysTray.separator,
      ItemExit,
    ],
  },
  debug: true,
  directory: "bin",
});

systray.on("click", (action: ClickEvent) => {
  switch (action.item.title) {
    case "Run now":
      exportAll();
      break;
    case "Exit":
      systray.kill();
      break;
  }
});

systray.on("ready", async () => {
  await exportAll();
  watcher = Deno.watchFs(config.clipPaths);
  for await (const event of watcher) {
    if (event.kind !== "create") continue;
    for (const clipPath of event.paths) {
      const pathParts = clipPath.split(path.SEPARATOR);
      const clipName = pathParts.pop() ?? "";
      const basePath = path.join("", ...pathParts);
      if (!clipName.startsWith("clip_")) continue;
      setTimeout(() => exportSingleEntry(basePath, clipName), 10_000);
    }
  }
});

systray.on("exit", () => {
  console.log("exited");
  watcher?.close();
  Deno.exit(0);
});

systray.on("error", (error) => {
  console.log(error);
});
