import { NewFileTask } from "../types";
import * as fs from "fs";
import * as vscode from "vscode";
import { SourceFile } from "file-generator/SourceFile";
import { resolveVariables, VariableResolverService } from "./variable-resolver";

const NONE_MESSAGE = "- no option will be passed to the arguments";

export const createCommand = async (
  sourceFile: SourceFile,
  newSourceFile: SourceFile,
  task: NewFileTask
) => {
  let stringBuilder: string[] = [];

  const args = task.args ? task.args.map((x) => x) : undefined;

  stringBuilder.push(task.command);

  const sourceFileVariableResolver = new VariableResolverService(
    vscode.workspace.workspaceFolders!,
    sourceFile.getAbsolutePath()
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

          const newItems = [
            {
              label: "none",
              picked: true,
              description: NONE_MESSAGE,
            },
            ...(items as vscode.QuickPickItem[]),
          ];
          const opt = await getQuickPromptPick(
            newItems as vscode.QuickPickItem[]
          );
          if (opt && opt.description !== NONE_MESSAGE) {
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
              if (task.showMessageIfPathNotExist) {
                vscode.window.showErrorMessage("Unable to locate " + arg);
              }
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

  command = resolveVariables(
    newSourceFile.getAbsolutePath(),
    command,
    sourceFile.getBaseDirectoryPath()
  );

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
