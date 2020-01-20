import * as fs from "fs";
import * as path from "path";
import { Uri, window } from "vscode";

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

    if (this.shouldCreateTestDirectory(testDirPath)) {
      testDirPath = this.createTestDirectoryIfNotExists(testDirPath);
    }

    const fileName = this.getTestFileName();
    const testFilePath = path.join(testDirPath, fileName);

    // If test file already exists then display an error and open the existing test file.
    if (fs.existsSync(testFilePath)) {
      this.switchToTestFile(testFilePath);

      throw new Error(
        `File already exists at ${this.getRelativePath(testFilePath)}.`
      );
    }

    // Write the default template or template specified by the user in the test file.
    this.writeContentToFile(testFilePath, fileType).then((success: boolean) => {
      if (success) {
        if (this.configuration.shouldSwitchToFile()) {
          this.switchToTestFile(testFilePath);
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

  // When file path already contains test directory name, don't create the test directory again.
  private shouldCreateTestDirectory(dirPath: string): boolean {
    return (
      dirPath.indexOf(
        path.sep + this.configuration.getTestDirectoryName() + path.sep
      ) === -1
    );
  }

  /**
   * Returns the name of the test file to be created. The implementation returns the test file name as
   * <fileName without extension>[dot]<suffix defined in configuration>[dot]<source file extension>
   */
  getTestFileName(): string {
    const suffix: string = this.configuration.getTestFilesSuffix();

    return [
      this.sourceFile.getNameWithoutExtension(),
      suffix,
      this.sourceFile.getExtension()
    ].join(".");
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

        fs.writeFile(filePath, stringTemplate, err => {
          if (err) {
            throw err;
          }
        });

        return true;
      }

      return false;
    });
  }

  switchToTestFile(filePath: string) {
    window.showTextDocument(Uri.file(filePath)).then(err => {
      if (err) {
        throw err;
      }
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
    return window.showQuickPick(Object.keys(template)).then(selected => {
      return selected
        ? (template as any)[selected]
        : TemplateManager.getDefaultTemplate(fileType);
    });
  }
}
