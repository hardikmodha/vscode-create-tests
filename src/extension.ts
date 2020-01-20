"use strict";
import * as vscode from "vscode";
import { TestFileCreator } from "./create-tests/TestFileCreator";
import { FileType } from "./create-tests/types";

export function activate(context: vscode.ExtensionContext) {
  const disposableTest = vscode.commands.registerCommand(
    "createTests.create",
    (sourceFile: vscode.Uri) => {
      TestFileCreator.createFor(sourceFile, FileType.Test);
    }
  );

  const disposableStory = vscode.commands.registerCommand(
    "createStory.create",
    (sourceFile: vscode.Uri) => {
      TestFileCreator.createFor(sourceFile, FileType.Story);
    }
  );

  context.subscriptions.push(disposableTest);
  context.subscriptions.push(disposableStory);
}

// this method is called when your extension is deactivated
// tslint:disable-next-line
export function deactivate() {}
