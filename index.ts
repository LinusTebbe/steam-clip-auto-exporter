import * as path from "@std/path";
import { exec } from "node:child_process";

import {
  configPath,
  fileExists,
  readAndValidateConfig,
  writeCorrectedMpdFile,
  writeDefaultConfig,
} from "./fileUtilities.ts";

if (!await fileExists(configPath)) {
  await writeDefaultConfig();
  console.error(
    "Created config.json with default values. Please edit it to your needs!",
  );
  Deno.exit(1);
}

const config = await readAndValidateConfig();

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

const userDataPath = path.join(config.steamInstallPath, "userdata");

for (const userPath of Deno.readDirSync(userDataPath)) {
  if (!userPath.isDirectory) continue;
  const clipsPath = path.join(
    userDataPath,
    userPath.name,
    "gamerecordings",
    "clips",
  );
  for (const clipWrapperPath of Deno.readDirSync(clipsPath)) {
    const videoPath = path.join(clipsPath, clipWrapperPath.name, "video");
    for (const clipPath of Deno.readDirSync(videoPath)) {
      const inputDirectory = path.join(videoPath, clipPath.name);

      const appName = appIds[clipPath.name.split("_")[1]];
      const outputFileName = clipWrapperPath.name.replace(
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
    }
  }
}
