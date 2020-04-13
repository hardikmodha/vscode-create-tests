import * as fs from "fs";
import * as path from "path";
import { window } from "vscode";
import { getTestFileName, isTestDirectory, switchToFile } from "./utils";
import { Configuration } from "./config/Configuration";
import { SourceFile } from "./SourceFile";
import { TemplateManager } from "./templates/TemplateManager";
import { Template, FileType } from "./types";

import mkdirp = require("mkdirp");

/**
 * A helper class which defines methods to create a test file for any particular source file based on the
 * provided configuration.
 */
export class CreationHelper {
  private sourceFile: SourceFile;
  private configuration: Configuration;

  constructor(sourceFile: SourceFile, configuration: Configuration) {
    this.sourceFile = sourceFile;
    this.configuration = configuration;
  }

  /**
   * Main method to create a test file.
   */
  createTestFile(fileType: FileType) {
    let testDirPath = this.configuration.getTestFilesLocation();

    if (
      !isTestDirectory(this.configuration.getTestDirectoryName(), testDirPath)
    ) {
      testDirPath = this.createTestDirectoryIfNotExists(testDirPath);
    }

    if (!fs.existsSync(testDirPath)) {
      mkdirp.sync(testDirPath);
    }

    const fileName = getTestFileName(this.sourceFile, this.configuration);
    const testFilePath = path.join(testDirPath, fileName);

    // If test file already exists then display an error and open the existing test file.
    if (fs.existsSync(testFilePath)) {
      switchToFile(testFilePath);

      throw new Error(
        `File already exists at ${this.getRelativePath(testFilePath)}.`
      );
    }

    // Write the default template or template specified by the user in the test file.
    this.writeContentToFile(testFilePath, fileType).then((success: boolean) => {
      if (success) {
        if (this.configuration.shouldSwitchToFile()) {
          switchToFile(testFilePath);
        }

        window.showInformationMessage("File has been created successfully.");
      }
    });
  }

  createTestDirectoryIfNotExists(testDirPath: string): string {
    const testDirName = this.configuration.getTestDirectoryName();
    const pathToTestDir: string = path.join(testDirPath, testDirName);

    mkdirp.sync(pathToTestDir);

    return pathToTestDir;
  }

  getRelativePath(testFilePath: string): string {
    const rootDirPath: string = this.sourceFile.getBaseDirectoryPath();

    return path.relative(rootDirPath, testFilePath);
  }

  /**
   * This method creates the test file and writes the template specified in the configuration.
   */
  writeContentToFile(filePath: string, fileType: FileType): Thenable<boolean> {
    return this.getTemplate(fileType).then((content: string[]) => {
      if (content.length > 0) {
        const stringTemplate: string = TemplateManager.replacePlaceHolders(
          this.sourceFile,
          filePath,
          content
        );

        fs.writeFile(filePath, stringTemplate, (err) => {
          if (err) {
            throw err;
          }
        });

        return true;
      }

      return false;
    });
  }

  getTemplate(fileType: FileType): Thenable<string[]> {
    let template: Template = TemplateManager.getTemplateForFile(
      this.sourceFile,
      fileType
    );

    if (Array.isArray(template) && !template.length) {
      template = TemplateManager.getDefaultTemplate(fileType);
    }

    // If only single template is defined then return it
    if (Array.isArray(template)) {
      return Promise.resolve(template);
    }

    // ...else display all the available options to user and let him/her choose the template.
    return window.showQuickPick(Object.keys(template)).then((selected) => {
      return selected
        ? (template as any)[selected]
        : TemplateManager.getDefaultTemplate(fileType);
    });
  }
}
