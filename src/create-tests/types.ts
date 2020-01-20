import { DefaultLocationForTestFiles } from "./constants";

export interface IConfiguration {
  filesSuffix: string;
  directoryName: string;
  customTestFilesLocation: string;
  defaultLocationForFiles: DefaultLocationForTestFiles;
  shouldSwitchToFile: boolean;
  sourceDir: string;
}

export type Template = string[] | { [key: string]: string[] };

export enum FileType {
  Story,
  Test
}
