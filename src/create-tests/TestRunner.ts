import * as vscode from "vscode";
import * as fs from "fs";
import { ConfigurationManager } from "./config/ConfigurationManager";
import { CreationHelper } from "./CreationHelper";
import { SourceFile } from "./SourceFile";
import { FileType } from "./types";
import { createCommand, switchToFile } from "./utils";
import { TestFileHelper } from "create-tests/TestFileHelper";

export class TestRunner {
  private terminal: vscode.Terminal | null = null;

  constructor() {
    this.setup();
  }

  run(args: vscode.Uri, fileType: FileType) {
    let workspacePath = vscode.workspace.rootPath;

    var fileName = args.fsPath
      ? args.fsPath
      : vscode.window.activeTextEditor &&
        vscode.window.activeTextEditor!.document.fileName;

    if (!workspacePath) return;

    const sourceFile = new SourceFile(
      fileName ? vscode.Uri.file(fileName) : vscode.Uri.file(workspacePath)
    );
    const configs = ConfigurationManager.getConfiguration(sourceFile, fileType);

    const task = configs.getTask(args.toString());

    if (!task) {
      return;
    }

    if (!configs.isValidExtension(sourceFile)) {
      vscode.window.showErrorMessage("Invalid file extension!");
      return;
    }

    let newCreated = false;

    const testFileHelper = new TestFileHelper(configs, sourceFile);

    if (!fs.existsSync(testFileHelper.getTestFileAbsolutePath())) {
      try {
        const helper = new CreationHelper(sourceFile, configs, testFileHelper);
        helper.createTestFile(fileType);
      } catch (error) {
        vscode.window.showErrorMessage(error.message);
      }

      newCreated = true;
    }

    const parentSourceFile = testFileHelper.getParentSourceFile(sourceFile);
    const testFileSource = testFileHelper.getTestSourceFile();

    const command = createCommand(
      parentSourceFile.getAbsolutePath(),
      testFileSource,
      task
    );

    // do not continue nothing to test if it not in watch mode
    if (newCreated && !configs.includesWatchCommands(command)) {
      return;
    }

    if (task.shouldSwitchToFile) {
      switchToFile(testFileSource.getAbsolutePath());
    }

    this.runTerminalCommand(command, task.openInNewTerminal);
  }

  runTerminalCommand = async (command: string, newTerminal: boolean) => {
    let terminal = this.terminal!;

    if (!this.terminal) {
      this.terminal = vscode.window.createTerminal("testRunner");
      terminal = this.terminal;
    }

    if (newTerminal) {
      terminal = vscode.window.createTerminal("testRunner");
    }

    terminal.show();
    await vscode.commands.executeCommand("workbench.action.terminal.clear");
    terminal.sendText(command);

    if (vscode.window.activeTextEditor)
      switchToFile(vscode.window.activeTextEditor.document.fileName);
  };

  private setup() {
    vscode.window.onDidCloseTerminal(() => {
      this.terminal = null;
    });
  }
}
