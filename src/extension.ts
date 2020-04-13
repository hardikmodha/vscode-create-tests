"use strict";
import * as vscode from "vscode";
import { FileCreator } from "./create-tests/FileCreator";
import { TestRunner } from "./create-tests/TestRunner";
import { FileType } from "./create-tests/types";

export function activate(context: vscode.ExtensionContext) {
  const disposableTest = vscode.commands.registerCommand(
    "testRunner.create",
    (sourceFile: vscode.Uri) => {
      FileCreator.createFor(sourceFile, FileType.Test);
    }
  );

  const testRunnerInstance = new TestRunner();

  const disposableStory = vscode.commands.registerCommand(
    "createStory.create",
    (sourceFile: vscode.Uri) => {
      FileCreator.createFor(sourceFile, FileType.Story);
    }
  );
  const testRunner = vscode.commands.registerCommand(
    "testRunner.test",
    (sourceFile: vscode.Uri) => {
      testRunnerInstance.run(sourceFile, FileType.Test);
    }
  );

  context.subscriptions.push(testRunner);
  context.subscriptions.push(disposableTest);
  context.subscriptions.push(disposableStory);
}

// this method is called when your extension is deactivated
// tslint:disable-next-line
export function deactivate() {}
