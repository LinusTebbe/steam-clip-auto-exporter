import { fileExists } from "./fileUtilities.ts";
import * as path from "@std/path";

const configPath = path.join("./", "config.json");

if (!await fileExists(configPath)) {
  await Deno.writeTextFile(
    configPath,
    JSON.stringify(
      {
        steamInstallPath: "C:\\Program Files (x86)\\Steam",
        outputPath: "C:\\Users\\YOUR_USER\\Videos",
      },
      null,
      2,
    ),
  );
  console.error(
    "Created config.json with default values. Please edit it to your needs!",
  );
  Deno.exit(1);
}

const configObject = JSON.parse(Deno.readTextFileSync(configPath));

if (!await fileExists(configObject.steamInstallPath ?? null)) {
  console.error("Steam installation path does not exist");
  Deno.exit(1);
}
if (!await fileExists(configObject.outputPath ?? null)) {
  console.error("Output path does not exist");
  Deno.exit(1);
}

const userDataPath = path.join(configObject.steamInstallPath, "userdata");
const clipPaths = Deno.readDirSync(userDataPath).toArray().map((
  userPath: Deno.DirEntry,
): string =>
  path.join(
    userDataPath,
    userPath.name,
    "gamerecordings",
    "clips",
  )
);

export default {
  clipPaths: clipPaths,
  outputPath: configObject.outputPath,
};
