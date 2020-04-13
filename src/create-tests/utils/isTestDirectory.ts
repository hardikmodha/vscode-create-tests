import * as path from "path";

export const isTestDirectory = (dirName: string, dirPath: string) => {
  // const dir = dirPath.replace(/^[\\/]+|[\\/]+$/g, "");
  return dirPath.indexOf(path.sep + dirName) !== -1;
};
