import * as path from "path";
import { workspace } from "vscode";
import { SourceFile } from "../SourceFile";
import { Template } from "../types";
import { getDirectoryPath } from "../utils";

/**
 * Class which defines methods to get file-template/code-snippets for the different type of files.
 */
export class TemplateManager {
  /**
   * This method reads the configuration and returns the template which matches with the extension
   * of the source file. e.g. If the file extension is ".ts" then the method returns the template
   * defined with configuration "fileGenerator.template.ts".
   *
   * @param file SourceFile instance
   */
  static getTemplateForFile(file: SourceFile, template?: Template) {
    return template;
  }

  /**
   * This method returns the default template by reading the configuration from the key
   * "fileGenerator.template.default".
   */
  static getDefaultTemplate(): string[] {
    const templates = workspace.getConfiguration("fileGenerator.template");

    return templates.get("default", []);
  }

  /**
   * This method replaces the "moduleName" and "modulePath" like placeholders in the template and
   * replaces them with the actual value of module name and path.
   */
  static replacePlaceHolders(
    sourceFile: SourceFile,
    newFilePath: string,
    template: string[]
  ): string {
    const newFilePathFromProjectRoot: string = path.relative(
      sourceFile.getBaseDirectoryPath(),
      newFilePath
    );

    const sourceFileDir = getDirectoryPath(sourceFile.getRelativeFileDirname());
    const moduleName = sourceFile.getNameWithoutExtension();
    const newFileDir = getDirectoryPath(newFilePathFromProjectRoot);
    const relativePath = path.relative(newFileDir, sourceFileDir);
    const importPath = [relativePath, moduleName].join("/");

    return template
      .join("\n")
      .replace(/\$\{moduleName\}/g, `${moduleName}`)
      .replace(/\$\{modulePath\}/g, `${importPath}`);
  }
}
