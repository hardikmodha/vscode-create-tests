import { workspace } from "vscode";
import { SourceFile } from "../SourceFile";
import { Configuration } from "./Configuration";
import { FileType } from "../types";

export class ConfigurationManager {
  static getConfiguration(
    sourceFile: SourceFile,
    fileType: FileType
  ): Configuration {
    if (fileType === FileType.Story)
      return new Configuration(
        workspace.getConfiguration("createStory"),
        sourceFile
      );

    return new Configuration(
      workspace.getConfiguration("testRunner"),
      sourceFile
    );
  }
}
