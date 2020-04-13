import * as path from "path";
import { workspace } from "vscode";
import { SourceFile } from "../SourceFile";
import { Template, FileType } from "../types";
import { getDirectoryPath } from "../utils";

/**
 * Class which defines methods to get file-template/code-snippets for the different type of files.
 */
export class TemplateManager {
  /**
   * This method reads the configuration and returns the template which matches with the extension
   * of the source file. e.g. If the file extension is ".ts" then the method returns the template
   * defined with configuration "testRunner.template.ts".
   *
   * @param file SourceFile instance
   */
  static getTemplateForFile(file: SourceFile, fileType: FileType): Template {
    const templates = workspace.getConfiguration(
      fileType === FileType.Test
        ? "testRunner.template"
        : "createStory.template"
    );

    return templates.get(file.getExtension(), []);
  }

  /**
   * This method returns the default template by reading the configuration from the key
   * "testRunner.template.default".
   */
  static getDefaultTemplate(fileType: FileType): string[] {
    const templates = workspace.getConfiguration(
      fileType === FileType.Test
        ? "testRunner.template"
        : "createStory.template"
    );

    return templates.get("default", []);
  }

  /**
   * This method replaces the "moduleName" and "modulePath" like placeholders in the template and
   * replaces them with the actual value of module name and path.
   */
  static replacePlaceHolders(
    sourceFile: SourceFile,
    testFilePath: string,
    template: string[]
  ): string {
    const testFilePathFromProjectRoot: string = path.relative(
      sourceFile.getBaseDirectoryPath(),
      testFilePath
    );

    const sourceFileDir = getDirectoryPath(sourceFile.getRelativeFileDirname());
    const moduleName = sourceFile.getNameWithoutExtension();
    const testFileDir = getDirectoryPath(testFilePathFromProjectRoot);
    const relativePath = path.relative(testFileDir, sourceFileDir);
    const importPath = [relativePath, moduleName].join("/");

    return template
      .join("\n")
      .replace(/\$\{moduleName\}/g, `${moduleName}`)
      .replace(/\$\{modulePath\}/g, `${importPath}`);
  }
}
