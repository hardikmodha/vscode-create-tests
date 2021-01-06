import * as fs from "fs";
import * as path from "path";
import { window } from "vscode";
import { getFileName, isNewDirectory, switchToFile } from "./utils";
import { Configuration } from "./config/Configuration";
import { SourceFile } from "./SourceFile";
import { TemplateManager } from "./templates/TemplateManager";
import { NewFileHelper } from "./NewFileHelper";
import mkdirp = require("mkdirp");
import { Template } from "./types";
import { resolveVariables } from "./utils/variable-resolver";

/**
 * A helper class which defines methods to create a new file for any particular source file based on the
 * provided configuration.
 */
export class CreationHelper {
  private sourceFile: SourceFile;
  private configuration: Configuration;
  newFileHelper: NewFileHelper;

  constructor(
    sourceFile: SourceFile,
    configuration: Configuration,
    newFileHelper: NewFileHelper
  ) {
    this.sourceFile = sourceFile;
    this.configuration = configuration;
    this.newFileHelper = newFileHelper;
  }

  /**
   * Main method to create a new file.
   */
  createFile(template?: Template) {
    let dirPath = this.newFileHelper.getFilesLocation();

    if (!isNewDirectory(this.configuration.getDirectoryName(), dirPath)) {
      dirPath = this.createDirectoryIfNotExists(dirPath);
    }

    if (!fs.existsSync(dirPath)) {
      mkdirp.sync(dirPath);
    }

    const fileName = getFileName(this.sourceFile, this.configuration);
    const filePath = path.join(dirPath, fileName);

    // If file already exists then display an error and open the existing file.
    if (fs.existsSync(filePath)) {
      switchToFile(filePath);

      throw new Error(
        `File already exists at ${this.getRelativePath(filePath)}.`
      );
    }

    // Write the default template or template specified by the user in the file.
    this.writeContentToFile(filePath, template).then((success: boolean) => {
      if (success) {
        if (this.configuration.shouldSwitchToFile()) {
          switchToFile(filePath);
        }

        window.showInformationMessage("File has been created successfully.");
      }
    });
  }

  createDirectoryIfNotExists(dirPath: string): string {
    const dirName = this.configuration.getDirectoryName();
    const pathToDir: string = path.join(dirPath, dirName);

    mkdirp.sync(pathToDir);

    return pathToDir;
  }

  getRelativePath(filePath: string): string {
    const rootDirPath: string = this.sourceFile.getBaseDirectoryPath();

    return path.relative(rootDirPath, filePath);
  }

  /**
   * This method creates the file and writes the template specified in the configuration.
   */
  writeContentToFile(filePath: string, template?: Template): Thenable<boolean> {
    return this.getTemplate(template).then((content: string[]) => {
      let stringTemplate: string = "";
      if (content.length > 0) {
        stringTemplate = TemplateManager.replacePlaceHolders(
          this.sourceFile,
          filePath,
          content
        );
      }

      const path = this.sourceFile.getAbsolutePath();

      stringTemplate = resolveVariables(
        this.configuration,
        path,
        stringTemplate,
        filePath
      );

      fs.writeFile(filePath, stringTemplate, (err) => {
        if (err) {
          throw err;
        }
      });
      return true;
    });
  }

  getTemplate(template?: Template): Thenable<string[]> {
    // let templateStr: Template = TemplateManager.getTemplateForFile(
    //   this.sourceFile
    // );

    if (Array.isArray(template) && !template.length) {
      return Promise.resolve([""]);
    }

    // If only single template is defined then return it
    if (Array.isArray(template)) {
      return Promise.resolve(template);
    }

    return Promise.resolve([""]);
    // ...else display all the available options to user and let him/her choose the template.
    // return window.showQuickPick(Object.keys(template)).then((selected) => {
    //   return selected
    //     ? (template as any)[selected]
    //     : TemplateManager.getDefaultTemplate();
    // });
  }
}
