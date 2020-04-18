import { NewFileTask } from "../types";
import * as fs from "fs";
import * as vscode from "vscode";
import { AbstractVariableResolverService } from "../../vs/variableResolver";
import { SourceFile } from "file-generator/SourceFile";

export class VariableResolverService extends AbstractVariableResolverService {
  constructor(
    folders: vscode.WorkspaceFolder[],
    sourceFilePath: string,
    env?: any
  ) {
    super(
      {
        getFolderUri: (folderName: string): vscode.Uri | undefined => {
          const found = folders.filter((f) => f.name === folderName);
          if (found && found.length > 0) {
            return found[0].uri;
          }
          return undefined;
        },
        getWorkspaceFolderCount: (): number => {
          return folders.length;
        },
        getConfigurationValue: (): string | undefined => {
          return undefined;
        },
        getExecPath: (): string | undefined => {
          return undefined;
        },
        getFilePath: (): string | undefined => {
          return sourceFilePath;
        },
        getSelectedText: (): string | undefined => {
          return undefined;
        },
        getLineNumber: (): string | undefined => {
          return undefined;
        },
      },
      env
    );
  }
}

export const createCommand = async (
  sourceFile: string,
  newSourceFile: SourceFile,
  task: NewFileTask
) => {
  let stringBuilder: string[] = [];

  const args = task.args ? task.args.map((x) => x) : undefined;

  stringBuilder.push(task.command);

  const sourceFileVariableResolver = new VariableResolverService(
    vscode.workspace.workspaceFolders!,
    sourceFile
  );

  const workSpaceFolder = vscode.workspace.getWorkspaceFolder(
    vscode.Uri.file(vscode.workspace.rootPath!)
  );

  // https://code.visualstudio.com/docs/editor/variables-reference#_input-variables
  if (args) {
    if (task.userInputPrompt && task.userInputPrompt[0]) {
      if (Array.isArray(task.userInputPrompt[0])) {
        for (let i = 0; i < task.userInputPrompt.length; i++) {
          const items = task.userInputPrompt[i];
          const opt = await getQuickPromptPick(items as vscode.QuickPickItem[]);
          if (opt) {
            args.push(opt.label);
          }
        }
      } else {
        const opt = await getQuickPromptPick(
          task.userInputPrompt as vscode.QuickPickItem[]
        );
        if (opt) {
          args.push(opt.label);
        }
      }
    }

    const filteredArgs = args.reduce((arr, arg) => {
      if (task.checkIfArgPathExist) {
        task.checkIfArgPathExist?.forEach((argToCheck) => {
          // make sure config has valid path
          if (arg.trim().startsWith(argToCheck)) {
            const keyVal = arg.split("=")[1];
            const path = sourceFileVariableResolver.resolve(
              workSpaceFolder as any,
              keyVal
            );
            if (fs.existsSync(path)) {
              arr.push(arg);
            } else {
              vscode.window.showErrorMessage("Unable to locate " + arg);
            }
          } else {
            arr.push(arg);
          }
        });
      } else {
        arr.push(arg);
      }

      return arr;
    }, [] as string[]);
    stringBuilder = [...stringBuilder, ...filteredArgs];
  }

  let command = stringBuilder.join(" ");

  command = sourceFileVariableResolver.resolve(workSpaceFolder as any, command);

  command = command.split("${targetFile}").join("${file}");
  command = command.split("${relativeTargetFile}").join("${relativeFile}");
  command = command
    .split("${relativeTargetFileDirname}")
    .join("${relativeFileDirname}");
  command = command.split("${targetFileDirname}").join("${fileDirname}");
  command = command.split("${targetFileExtname}").join("${fileExtname}");
  command = command.split("${targetFileBasename}").join("${fileBasename}");
  command = command
    .split("${targetFileBasenameNoExtension}")
    .join("${fileBasenameNoExtension}");

  const newFileVariableResolver = new VariableResolverService(
    vscode.workspace.workspaceFolders!,
    newSourceFile.getAbsolutePath()
  );
  command = newFileVariableResolver.resolve(workSpaceFolder as any, command);

  if (task.useForwardSlash) {
    command = command.split("\\").join("/");
  }

  return command;
};

const getQuickPromptPick = async (items: vscode.QuickPickItem[]) => {
  const configPicked = await vscode.window.showQuickPick(items);
  if (configPicked) {
    return configPicked;
  }
  return;
};
