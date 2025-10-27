import { xml_document } from "@libs/xml/stringify";

export interface MpdFile extends xml_document {
  MPD: {
    Period: {
      "@start": string;
    };
  };
}
