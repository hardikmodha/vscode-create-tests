import { workspace, window, Uri } from "vscode";

export const getCurrentWorkspacePath = (sourceFileUri?: Uri) => {
  const uri =
    sourceFileUri ||
    (window.activeTextEditor && window.activeTextEditor.document.uri);

  if (!uri) return;
  const workspaceFolder = workspace.getWorkspaceFolder(uri);
  if (workspaceFolder) return workspaceFolder.uri.fsPath;

  return;
};
