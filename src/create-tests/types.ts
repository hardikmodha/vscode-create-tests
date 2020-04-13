import { DefaultLocationForTestFiles } from "./constants";

export interface TestTask {
  label: string;
  args?: string[];
  useForwardSlash: boolean;
  command: string;
  default: boolean;
  shouldSwitchToFile: boolean;
  openInNewTerminal: boolean;
}

export interface IConfiguration {
  filesSuffix: string;
  fileSuffixType: "extension" | "append";
  directoryName: string;
  customTestFilesLocation: string;
  defaultLocationForFiles: DefaultLocationForTestFiles;
  shouldSwitchToFile: boolean;
  sourceDir: string;
  tasks: TestTask[];
  supportedExtension: string[];
  watchCommands: string[];
  configs: IConfiguration[];
}

export type Template = string[] | { [key: string]: string[] };

export enum FileType {
  Story = "story",
  Test = "test",
}
