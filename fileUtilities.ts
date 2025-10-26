import * as path from "@std/path";
import { ConfigFile, MpdFile } from "./interfaces.ts";
import { parse, stringify } from "@libs/xml";

export const configPath = path.join("./", "config.json");

export async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.lstat(path);
    return true;
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    return false;
  }
}

export async function writeCorrectedMpdFile(
  clipDirectory: string,
): Promise<string> {
  const targetPath = path.join(clipDirectory, "session.corrected.mpd");
  if (await fileExists(targetPath)) return targetPath;
  const dom = parse(
    await Deno.open(path.join(clipDirectory, "session.mpd")),
  ) as MpdFile;
  dom.MPD.Period["@start"] = "PT0.0S";
  await Deno.writeTextFile(targetPath, stringify(dom));
  return targetPath;
}

export async function writeDefaultConfig(): Promise<void> {
  await Deno.writeTextFile(
    configPath,
    JSON.stringify(
      {
        "steamInstallPath": "C:\\Program Files (x86)\\Steam",
        "outputPath": "C:\\Users\\YOUR_USER\\Videos",
      },
      null,
      2,
    ),
  );
}

export async function readAndValidateConfig(): Promise<ConfigFile> {
  const config = JSON.parse(Deno.readTextFileSync(configPath)) as ConfigFile;

  if (!await fileExists(config.steamInstallPath)) {
    console.error("Steam installation path does not exist");
    Deno.exit(1);
  }
  if (!await fileExists(config.outputPath)) {
    console.error("Output path does not exist");
    Deno.exit(1);
  }

  return config;
}
