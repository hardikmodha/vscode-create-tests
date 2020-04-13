import { TestTask } from "../types";
import * as fs from "fs";
import * as vscode from "vscode";
import { AbstractVariableResolverService } from "../../vs/variableResolver";
import { SourceFile } from "create-tests/SourceFile";

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
  testSourceFile: SourceFile,
  task: TestTask
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

  command = command.split("${testFile}").join("${file}");
  command = command.split("${relativeTestFile}").join("${relativeFile}");
  command = command
    .split("${relativeTestFileDirname}")
    .join("${relativeFileDirname}");
  command = command.split("${testFileDirname}").join("${fileDirname}");
  command = command.split("${testFileExtname}").join("${fileExtname}");
  command = command.split("${testFileBasename}").join("${fileBasename}");
  command = command
    .split("${testFileBasenameNoExtension}")
    .join("${fileBasenameNoExtension}");

  const testFileVariableResolver = new VariableResolverService(
    vscode.workspace.workspaceFolders!,
    testSourceFile.getAbsolutePath()
  );
  command = testFileVariableResolver.resolve(workSpaceFolder as any, command);

  if (task.useForwardSlash) {
    command = command.split("\\").join("/");
  }

  return command;
};
