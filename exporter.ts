import * as path from "@std/path";
import { exec } from "node:child_process";
import config from "./config.ts";

import { fileExists, writeCorrectedMpdFile } from "./fileUtilities.ts";

const clipNameRegex = /clip_\d+_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/;
const clipDestinationPattern = "$1-$2-$3 $4-$5-$6";

const appIds = await fetch(
  "https://api.steampowered.com/ISteamApps/GetAppList/v2",
)
  .then((res) => res.json())
  .then((res) =>
    Object.fromEntries(
      res.applist.apps.map((
        app: { appid: number; name: string },
      ) => [app.appid, app.name]),
    )
  );

export async function exportAll() {
  for (const clipsPath of config.clipPaths) {
    for (const clipWrapperPath of Deno.readDirSync(clipsPath)) {
      await exportSingleEntry(clipsPath, clipWrapperPath.name);
    }
  }
}

export async function exportSingleEntry(
  clipParentFolder: string,
  clipName: string,
) {
  const videoPath = path.join(clipParentFolder, clipName, "video");
  for (const clipPath of Deno.readDirSync(videoPath)) {
    const inputDirectory = path.join(videoPath, clipPath.name);

    const appName = appIds[clipPath.name.split("_")[1]];
    const outputFileName = clipName.replace(
      clipNameRegex,
      `${appName} ${clipDestinationPattern}.mp4`,
    );
    const outputFile = path.join(config.outputPath, outputFileName);
    if (await fileExists(outputFile)) {
      console.log(`Skipping ${inputDirectory}. Already exported`);
      continue;
    }
    const inputFile = await writeCorrectedMpdFile(inputDirectory);

    console.log(`Exporting ${inputDirectory} to ${outputFile}`);

    await exec(
      `ffmpeg -i "${inputFile}" -c copy "${outputFile}"`,
    );
    return;
  }
}
