import { Configuration } from "../config/Configuration";
import { SourceFile } from "../SourceFile";

/**
 * Returns the name of the test file to be created. The implementation returns the test file name as
 * <fileName without extension>[dot]<suffix defined in configuration>[dot]<source file extension>
 */

export const getTestFileName = (
  sourceFile: SourceFile,
  config: Configuration
) => {
  const suffix: string = config.getTestFilesSuffix();

  return [
    sourceFile.getNameWithoutExtension(),
    suffix,
    sourceFile.getExtension(),
  ].join(".");
};
