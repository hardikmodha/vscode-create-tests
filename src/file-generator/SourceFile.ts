import * as path from "path";
import { findRootDir } from "./utils";
import { Uri, workspace, WorkspaceFolder } from "vscode";
import { getDirectoryPath, getCurrentWorkspacePath } from "./utils";
import { Configuration } from "./config/Configuration";

export class SourceFile {
  private sourceFileUri: Uri;
  private workSpaceFolder: WorkspaceFolder | undefined;
  private _configs: Configuration;

  constructor(sourceFileUri: Uri, configs: Configuration) {
    this.sourceFileUri = sourceFileUri;
    this.workSpaceFolder = workspace.getWorkspaceFolder(sourceFileUri);
    this._configs = configs;
  }

  getBaseDirectoryPath(): string {
    let baseDirPath;
    const rootFilenameOrExtension = this._configs.getRootByFilenameOrExtension();

    if (rootFilenameOrExtension) {
      baseDirPath = findRootDir(
        path.dirname(this.sourceFileUri.fsPath),
        rootFilenameOrExtension,
        this._configs.getDirectorySuffix(),
        !Boolean(this._configs.getDirectoryName())
      );
    } else {
      const workSpaceDir = this.workSpaceFolder
        ? this.workSpaceFolder.uri.fsPath
        : "";
      baseDirPath = workSpaceDir;
    }

    const rootDirName = this._configs.getRootDirName(baseDirPath);

    if (rootDirName && !path.isAbsolute(rootDirName)) {
      baseDirPath = path.resolve(baseDirPath, "..");
      baseDirPath = path.join(baseDirPath, rootDirName);
    }

    return baseDirPath;
  }

  getWorkSpaceDir() {
    return getCurrentWorkspacePath(this.sourceFileUri);
  }

  isEndWithDirectorySuffix(dir: string) {
    const suffix = this._configs.getDirectorySuffix();
    if (!suffix) return false;
    return dir.endsWith(suffix);
  }

  getAbsolutePath(): string {
    return this.sourceFileUri.fsPath;
  }

  getRelativeFileDirname(): string {
    let baseDir = this.getBaseDirectoryPath();
    const customDirName = this._configs.getDirectoryName();
    const dirSuffix = this._configs.getDirectorySuffix();

    if (customDirName) {
    } else if (dirSuffix) {
      baseDir += dirSuffix;
    }

    var relativePath = path.relative(baseDir, this.getAbsolutePath());

    if (this._configs.getRootByFilenameOrExtension() && dirSuffix) {
      var arr = relativePath.split(path.sep);
      relativePath = arr.splice(2, arr.length).join(path.sep);
    }

    if (customDirName && relativePath.split(path.sep)[0] === customDirName) {
      relativePath = relativePath.substring(
        customDirName.length,
        relativePath.length
      );
    }

    return relativePath;
  }

  getDirectoryPath(): string {
    return getDirectoryPath(this.getAbsolutePath());
  }

  getName(): string {
    return path.basename(this.sourceFileUri.fsPath);
  }

  getExtension(): string {
    return this.sourceFileUri.fsPath.split(".").pop() || "";
  }

  getNameWithoutExtension(): string {
    return path.basename(
      this.sourceFileUri.fsPath,
      path.extname(this.sourceFileUri.fsPath)
    );
  }
}
