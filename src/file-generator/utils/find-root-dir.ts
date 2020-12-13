import fs from "fs";
import path from "path";
import { getCurrentWorkspacePath } from "./workspace";
import { Uri } from "vscode";

const find = (
  filePath: string,
  rootFilenameOrExtension: string,
  directorySuffix: string,
  breakOnWorkSpace: boolean = true
): string => {
  const hasFile = fs.readdirSync(filePath).find((file) => {
    if (fs.statSync(path.join(filePath, file)).isDirectory()) {
      return false;
    }

    if (rootFilenameOrExtension!.startsWith(".")) {
      var ext = path.extname(file);
      if (ext === rootFilenameOrExtension) {
        return true;
      }
      return false;
    }
    return file === rootFilenameOrExtension;
  });

  if (!hasFile) {
    const nextPath = path.resolve(filePath, "..");

    if (directorySuffix && filePath.endsWith(directorySuffix)) {
      return filePath.substring(0, filePath.length - directorySuffix.length);
    }

    const workSpaceDir = getCurrentWorkspacePath(Uri.file(filePath));
    if (breakOnWorkSpace && workSpaceDir == nextPath) {
      return filePath;
    }

    return find(
      nextPath,
      rootFilenameOrExtension,
      directorySuffix,
      breakOnWorkSpace
    );
  }

  return filePath;
};

export const findRootDir = (
  filePath: string,
  rootFilenameOrExtension: string,
  directorySuffix: string,
  breakOnWorkSpace: boolean
) => find(filePath, rootFilenameOrExtension, directorySuffix, breakOnWorkSpace);
