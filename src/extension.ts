"use strict";
import * as vscode from "vscode";
import { TaskRunner } from "./file-generator/TaskRunner";

const taskRunnerInstance = new TaskRunner();

export function activate(context: vscode.ExtensionContext) {
  const fileGenerator = vscode.commands.registerCommand(
    "fileGenerator.run",
    (sourceFile: vscode.Uri) => {
      taskRunnerInstance.run(sourceFile);
    }
  );

  context.subscriptions.push(fileGenerator);
}

export function deactivate() {
  taskRunnerInstance.clean();
}
