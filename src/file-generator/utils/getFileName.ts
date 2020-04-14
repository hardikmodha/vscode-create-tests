import { Configuration } from "../config/Configuration";
import { SourceFile } from "../SourceFile";

/**
 * Returns the name of the new file to be created
 */

export const getFileName = (sourceFile: SourceFile, config: Configuration) => {
  const suffix = config.getNewFilesSuffix();
  const fileSuffixType = config.getFileSuffixType();

  let fileName = sourceFile.getNameWithoutExtension();

  if (suffix && fileSuffixType === "append to file name") {
    fileName += suffix;
  }

  const stringBuilder = [fileName];

  if (suffix && fileSuffixType === "extend extension") {
    stringBuilder.push(suffix);
  }

  if (suffix && fileSuffixType === "replace extension") {
    stringBuilder.push(suffix);
  } else {
    stringBuilder.push(sourceFile.getExtension());
  }

  return stringBuilder.join(".");
};
