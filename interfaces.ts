import { xml_document } from "@libs/xml/stringify";

export interface ConfigFile {
  steamInstallPath: string;
  outputPath: string;
}

export interface MpdFile extends xml_document {
  MPD: {
    Period: {
      "@start": string;
    };
  };
}
