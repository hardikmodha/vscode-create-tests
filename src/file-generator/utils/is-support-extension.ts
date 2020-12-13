import { Configuration } from "file-generator/config/Configuration";
import { SourceFile } from "file-generator/SourceFile";

export const isSupportExtension = (
  sourceFile: SourceFile,
  config: Configuration
) => {
  const extension = sourceFile.getExtension();

  const configByExtension = config.getSupportedExtension().includes(extension);

  if (!configByExtension) {
    return false;
  }

  return true;
};
