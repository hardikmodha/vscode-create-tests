import * as fs from "fs";
import * as vscode from "vscode";
import * as path from "path";
import { WorkspaceConfiguration } from "vscode";
import { IConfiguration, TestTask } from "../types";
import { SourceFile } from "../SourceFile";
import {
  getDirectoryPath,
  replaceSourceDir,
  getTestFileName,
  isTestDirectory,
} from "../utils";
import {
  DEFAULT_TEST_FILES_SUFFIX,
  DefaultLocationForTestFiles,
} from "../constants";
import mkdirp = require("mkdirp");

/**
 * A class used to hold the extension configurations. It also defines the getters to read the configuration.
 */
export class Configuration {
  private defaultConfiguration: IConfiguration = {
    defaultLocationForFiles: DefaultLocationForTestFiles.SAME_AS_SOURCE_FILE,
    directoryName: "",
    customTestFilesLocation: "",
    filesSuffix: DEFAULT_TEST_FILES_SUFFIX,
    shouldSwitchToFile: true,
    sourceDir: "src",
    supportedExtension: [],
    tasks: [],
    watchCommands: [],
  };

  private workspaceConfig: WorkspaceConfiguration;
  private sourceFile: SourceFile;

  constructor(config: WorkspaceConfiguration, sourceFile: SourceFile) {
    this.workspaceConfig = config;
    this.sourceFile = sourceFile;
  }

  /**
   * Helper method to return the default value. Handles the cases of empty string.
   */
  private getConfigValue(key: string, defaultValue: any) {
    const value: string | undefined = this.workspaceConfig.get(key);

    return value && value.length > 0 ? value : defaultValue;
  }

  getTasks(): TestTask[] {
    const configs = this.getConfigValue(
      "tasks",
      this.defaultConfiguration.tasks
    );
    return configs;
  }

  getDefaultLocationForTestFiles(): string {
    return this.getConfigValue(
      "defaultLocationForFiles",
      this.defaultConfiguration.defaultLocationForFiles
    );
  }

  getCustomLocationForTestFiles(): string {
    return this.getConfigValue("customLocationForFiles", "");
  }

  /**
   * This method reads the configuration and based on that returns the path of directory inside which test file
   * should be created. First it checks whether the `customLocationForFiles` is set or not. If the configuration
   * is absent then it reads the `defaultLocationForFiles` and based on that returns the directory path.
   */
  getTestFilesLocation(): string {
    let filesLocation: string = this.getCustomLocationForTestFiles();

    if (this.isTestFile(this.sourceFile)) {
      return this.sourceFile.getDirectoryPath();
    }

    if (filesLocation) {
      // If the path given by user is not absolute then first make it absolute
      if (!path.isAbsolute(filesLocation)) {
        filesLocation = path.normalize(
          path.join(this.sourceFile.getBaseDirectoryPath(), filesLocation)
        );
      }

      const sourceFilePath: string = this.sourceFile.getRelativeFileDirname();

      if (sourceFilePath.indexOf(path.sep) !== -1) {
        filesLocation = path.join(
          filesLocation,
          getDirectoryPath(sourceFilePath)
        );
      }

      filesLocation = replaceSourceDir(filesLocation, this.getSourceDir());

      return filesLocation;
    }

    switch (this.getDefaultLocationForTestFiles()) {
      case DefaultLocationForTestFiles.SAME_AS_SOURCE_FILE:
        let localFilePath: string = this.sourceFile.getDirectoryPath();

        if (
          !this.isTestFile(this.sourceFile) &&
          isTestDirectory(this.getTestDirectoryName(), localFilePath)
        ) {
          localFilePath = path.join(localFilePath, this.getTestDirectoryName());
        }

        return localFilePath;

      case DefaultLocationForTestFiles.PROJECT_ROOT:
        const sourceFilePath: string = this.sourceFile.getRelativeFileDirname();

        // Check whether the SourceFile is present inside multiple directories
        return sourceFilePath.indexOf(path.sep) > -1
          ? this.mimicSourceDirectoryStructure()
          : this.sourceFile.getBaseDirectoryPath();
    }

    return "";
  }

  /**
   * This method is used to mimic the directory structure of the source file.
   */
  private mimicSourceDirectoryStructure(): string {
    let directoryPath: string = path.join(
      this.sourceFile.getBaseDirectoryPath(),
      this.getTestDirectoryName(),
      getDirectoryPath(this.sourceFile.getRelativeFileDirname())
    );

    directoryPath = replaceSourceDir(directoryPath, this.getSourceDir());

    if (!fs.existsSync(directoryPath)) {
      mkdirp.sync(directoryPath);
    }

    return directoryPath;
  }

  getTestDirectoryName(): string {
    return this.getConfigValue(
      "directoryName",
      this.defaultConfiguration.directoryName
    );
  }

  getTestFilesSuffix(): string {
    return this.getConfigValue(
      "filesSuffix",
      this.defaultConfiguration.filesSuffix
    );
  }

  shouldSwitchToFile(): boolean {
    return this.workspaceConfig.get(
      "shouldSwitchToFile",
      this.defaultConfiguration.shouldSwitchToFile
    );
  }

  getSourceDir(): string {
    return this.workspaceConfig.get(
      "sourceDir",
      this.defaultConfiguration.sourceDir
    );
  }

  getWatchCommands() {
    return this.workspaceConfig.get(
      "watchCommands",
      this.defaultConfiguration.watchCommands
    );
  }

  includesWatchCommands(str: string) {
    const commands = this.getWatchCommands();
    if (!commands || !commands.length) return false;

    if (commands.find((x) => str.includes(x))) {
      return true;
    }

    return false;
  }

  getSupportedExtension() {
    return this.workspaceConfig.get(
      "supportedExtension",
      this.defaultConfiguration.supportedExtension
    );
  }
  isValidExtension(sourceFile: SourceFile) {
    const ext = sourceFile.getExtension();
    const extensions = this.getSupportedExtension();
    return extensions.indexOf(ext) !== -1;
  }
  isTestFile(sourceFile: SourceFile) {
    const ext = this.getTestFilesSuffix() + "." + sourceFile.getExtension();
    return sourceFile.getName().endsWith(ext);
  }

  getParentFileName(sourceFile: SourceFile) {
    const fileName = sourceFile.getNameWithoutExtension();
    const originalFile = fileName.replace("." + this.getTestFilesSuffix(), "");
    return originalFile + "." + sourceFile.getExtension();
    // const parentFile =  this.sourceFile.getName().;
  }
  getParentSourceFile(sourceFile: SourceFile) {
    const parentDir = sourceFile
      .getDirectoryPath()
      .replace(this.getTestDirectoryName(), "");
    const filePath = path.join(parentDir, this.getParentFileName(sourceFile));
    return new SourceFile(vscode.Uri.file(filePath));
  }
  getTestFilesDirectory() {
    let testDirPath = this.getTestFilesLocation();

    if (isTestDirectory(this.getTestDirectoryName(), testDirPath)) {
      const testDirName = this.getTestDirectoryName();
      testDirPath = path.join(testDirPath, testDirName);
    }
    return testDirPath;
  }
  getTestSourceFile() {
    return new SourceFile(vscode.Uri.file(this.getTestFileAbsolutePath()));
  }

  getTestFileAbsolutePath() {
    let testDirPath = this.getTestFilesLocation();

    if (!isTestDirectory(this.getTestDirectoryName(), testDirPath)) {
      const testDirName = this.getTestDirectoryName();
      testDirPath = path.join(testDirPath, testDirName);
    }

    const fileName = this.isTestFile(this.sourceFile)
      ? this.sourceFile.getName()
      : getTestFileName(this.sourceFile, this);
    const testFilePath = path.join(testDirPath, fileName);

    return testFilePath;
  }
  getTask(taskName: string) {
    const tasks = this.getTasks();
    let task = tasks.find((x) => x.label === taskName);
    if (!task) {
      task = tasks.find((x) => x.default);
    }
    if (!task) {
      vscode.window.showErrorMessage(
        "Unable to find the task, make sure to create a task configuration in setting.json file asn set the label."
      );
      return;
    }
    if (!task.command) {
      vscode.window.showErrorMessage("No command has been set for the task.");
      return;
    }

    // set defaults
    if (task.useForwardSlash === undefined) task.useForwardSlash = true;
    if (task.shouldSwitchToFile === undefined) task.shouldSwitchToFile = true;

    return task;
  }
}
