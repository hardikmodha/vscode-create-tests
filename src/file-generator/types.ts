import { DefaultLocationForNewFiles } from "./constants";
import { QuickPickItem } from "vscode";

export type TerminalInstanceType = "label" | "command" | "new";

export interface NewFileTask {
  label: string;
  args?: string[];
  useForwardSlash: boolean;
  command: string;
  default: boolean;
  shouldSwitchToFile: boolean;
  terminalInstanceType: "label" | "command" | "new";
  runTaskOnFileCreation: boolean;
  description: string;
  checkIfArgPathExist?: string[];
  showMessageIfPathNotExist?: boolean;
  userInputPrompt: QuickPickItem[][] | QuickPickItem[];
  shouldSwitchTerminalToCwd?: boolean;
}

export interface IConfiguration {
  filesSuffix?: string;
  fileSuffixType?:
    | "replace extension"
    | "extend extension"
    | "append to file name";
  directoryName: string;
  customFilesLocation: string;
  defaultLocationForFiles: DefaultLocationForNewFiles;
  shouldSwitchToFile: boolean;
  sourceDir: string;
  tasks: NewFileTask[];
  supportedExtension: string[];
  configs: IConfiguration[];
  label?: string;
  description?: string;
  template?: Template;
  rootFilenameOrExtension?: string;
  rootDirName?: string;
  directorySuffix: string;
  ignoreDirectories: boolean;
}

export type Template = string[] | { [key: string]: string[] };
