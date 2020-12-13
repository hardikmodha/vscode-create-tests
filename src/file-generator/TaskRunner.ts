import * as vscode from "vscode";
import { ConfigurationManager } from "./config/ConfigurationManager";
import { CreationHelper } from "./CreationHelper";
import { SourceFile } from "./SourceFile";
import { TerminalInstanceType } from "./types";
import { createCommand, switchToFile } from "./utils";
import { NewFileHelper } from "./NewFileHelper";
import { isSupportExtension } from "./utils";
import fs from "fs";

export class TaskRunner {
  private terminals: { [key: string]: vscode.Terminal } = {};

  constructor() {
    this.setup();
  }

  async run(args: vscode.Uri) {
    let workspacePath = vscode.workspace.rootPath;

    var fileName = args.fsPath
      ? args.fsPath
      : vscode.window.activeTextEditor &&
        vscode.window.activeTextEditor!.document.fileName;

    if (!workspacePath) return;

    const configs = await ConfigurationManager.getConfiguration(args);

    if (!configs) return;

    const sourceFile = new SourceFile(
      fileName ? vscode.Uri.file(fileName) : vscode.Uri.file(workspacePath),
      configs
    );

    if (!isSupportExtension(sourceFile, configs)) {
      vscode.window.showErrorMessage(
        "File extension not supported, to support the extension add an entry to 'fileGenerator.configs' and set 'supportedExtension' property."
      );
      return;
    }

    if (!configs.isValidExtension(sourceFile)) {
      vscode.window.showErrorMessage("Invalid file extension!");
      return;
    }

    let newCreated = false;
    const task = configs.getTask();

    const newFileHelper = new NewFileHelper(configs, sourceFile);

    var targetFileLocation = newFileHelper.getFileAbsolutePath();

    if (!fs.existsSync(targetFileLocation)) {
      try {
        const helper = new CreationHelper(sourceFile, configs, newFileHelper);
        helper.createFile(configs.getTemplate());
      } catch (error) {
        vscode.window.showErrorMessage(error.message);
      }

      newCreated = true;
    }

    const newFileSource = newFileHelper.getSourceFile();

    if (!task) {
      if (configs.shouldSwitchToFile()) {
        switchToFile(newFileSource.getAbsolutePath());
      }
      return;
    }

    const parentSourceFile = newFileHelper.getParentSourceFile(sourceFile);

    const command = await createCommand(parentSourceFile, newFileSource, task);

    if (newCreated && !task.runTaskOnFileCreation) {
      return;
    }

    if (task.shouldSwitchToFile) {
      switchToFile(newFileSource.getAbsolutePath());
    }

    this.runTerminalCommand(
      command,
      task.terminalInstanceType,
      args.toString(),
      task.label,
      task.shouldSwitchTerminalToCwd
        ? task.shouldSwitchToFile
          ? newFileSource.getDirectoryPath()
          : parentSourceFile.getDirectoryPath()
        : undefined
    );
  }

  runTerminalCommand = async (
    command: string,
    terminalType: TerminalInstanceType,
    args: string,
    terminalLabel: string,
    cwd?: string
  ) => {
    const terminalInstanceId =
      terminalType === "new" ? "" : terminalType === "command" ? command : args;

    let terminal = this.terminals[terminalInstanceId];

    if (terminalType === "new") {
      terminal = vscode.window.createTerminal({ name: terminalLabel, cwd });
    } else if (!terminal) {
      terminal = vscode.window.createTerminal({ name: terminalLabel, cwd });
      this.terminals[terminalInstanceId] = terminal;
    }

    terminal.show(true);
    await vscode.commands.executeCommand("workbench.action.terminal.clear");
    terminal.sendText(command);
  };

  private setup() {
    vscode.window.onDidCloseTerminal(() => {
      this.terminals = {};
    });
  }

  public clean() {
    this.terminals = {};
  }
}
