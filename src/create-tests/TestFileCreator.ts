import * as vscode from "vscode";
import { ConfigurationManager } from "./config/ConfigurationManager";
import { CreationHelper } from "./CreationHelper";
import { SourceFile } from "./SourceFile";
import { FileType } from "./types";

export class TestFileCreator {
  /**
   * This is the entry point when the "createTests.create","createStory.create" command gets executed.
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
      const helper = new CreationHelper(sourceFile, configs);
      helper.createTestFile(fileType);
    } catch (error) {
      vscode.window.showErrorMessage(error.message);
    }
  }
}
