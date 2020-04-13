import * as vscode from "vscode";
import { ConfigurationManager } from "./config/ConfigurationManager";
import { CreationHelper } from "./CreationHelper";
import { SourceFile } from "./SourceFile";
import { FileType } from "./types";
import { TestFileHelper } from "./TestFileHelper";

export class FileCreator {
  /**
   * This is the entry point when the "testRunner.create","createStory.create" command gets executed.
   * @param args {@link Uri} of the source file
   */
  static createFor(args: vscode.Uri, fileType: FileType) {
    if (!args) {
      return;
    }

    try {
      const sourceFile = new SourceFile(args);
      const configs = ConfigurationManager.getConfiguration(
        sourceFile,
        fileType
      );

      const helper = new CreationHelper(
        sourceFile,
        configs,
        new TestFileHelper(configs, sourceFile)
      );
      helper.createTestFile(fileType);
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }
}
