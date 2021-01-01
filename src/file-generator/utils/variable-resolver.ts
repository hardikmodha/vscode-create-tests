import { AbstractVariableResolverService } from "../../vs/variableResolver";
import * as vscode from "vscode";
import path from "path";
import { Configuration } from "file-generator/config/Configuration";

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

export const resolveVariables = (
  configs: Configuration,
  filePath: string,
  command: string,
  rootDir: string
) => {
  const workSpaceFolder = vscode.workspace.getWorkspaceFolder(
    vscode.Uri.file(vscode.workspace.rootPath!)
  );

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
    filePath
  );

  if (command.indexOf("${targetRootDirname}") !== -1) {
    const dirName = rootDir.split(path.sep).pop();
    command = command.split("${targetRootDirname}").join(dirName);
  }

  if (command.indexOf("${targetRootPath}") !== -1) {
    command = command.split("${targetRootPath}").join(rootDir);
  }

  if (command.indexOf("${targetDirNameWithoutDirSuffix}") !== -1) {
    const dirName = path.basename(
      rootDir.replace(configs.getDirectorySuffix(), "")
    );
    command = command.split("${targetDirNameWithoutDirSuffix}").join(dirName);
  }

  return newFileVariableResolver.resolve(workSpaceFolder as any, command);
};
