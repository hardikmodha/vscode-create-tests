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

export const createCommand = (
  sourceFile: string,
  newSourceFile: SourceFile,
  task: NewFileTask
) => {
  let stringBuilder: string[] = [];

  stringBuilder.push(task.command);

  const sourceFileVariableResolver = new VariableResolverService(
    vscode.workspace.workspaceFolders!,
    sourceFile
  );

  const workSpaceFolder = vscode.workspace.getWorkspaceFolder(
    vscode.Uri.file(vscode.workspace.rootPath!)
  );

  if (task.args) {
    const args = task.args.reduce((arr, arg) => {
      // make sure config has valid path
      if (arg.trim().startsWith("--config")) {
        const keyVal = arg.split("=")[1];
        const path = sourceFileVariableResolver.resolve(
          workSpaceFolder as any,
          keyVal
        );
        if (fs.existsSync(path)) {
          arr.push(arg);
        } else {
          vscode.window.showErrorMessage("Unable to locate " + path);
        }
      } else {
        arr.push(arg);
      }
      return arr;
    }, [] as string[]);
    stringBuilder = [...stringBuilder, ...args];
  }

  let command = stringBuilder.join(" ");

  command = sourceFileVariableResolver.resolve(workSpaceFolder as any, command);

  command = command.split("${newFile}").join("${file}");
  command = command.split("${relativeNewFile}").join("${relativeFile}");
  command = command
    .split("${relativeNewFileDirname}")
    .join("${relativeFileDirname}");
  command = command.split("${newFileDirname}").join("${fileDirname}");
  command = command.split("${newFileExtname}").join("${fileExtname}");
  command = command.split("${newFileBasename}").join("${fileBasename}");
  command = command
    .split("${newFileBasenameNoExtension}")
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
