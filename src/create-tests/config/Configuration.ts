import * as fs from "fs";
import * as path from "path";
import { WorkspaceConfiguration } from "vscode";
import { IConfiguration } from "../types";
import { SourceFile } from "../SourceFile";
import { getDirectoryPath, replaceSourceDir } from "../util";
import {
  DEFAULT_TEST_FILES_SUFFIX,
  DefaultLocationForTestFiles
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
    sourceDir: "src"
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
  private getConfigValue(key: string, defaultValue: string) {
    const value: string | undefined = this.workspaceConfig.get(key);

    return value && value.length > 0 ? value : defaultValue;
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

    if (filesLocation) {
      // If the path given by user is not absolute then first make it absolute
      if (!path.isAbsolute(filesLocation)) {
        filesLocation = path.normalize(
          path.join(this.sourceFile.getBaseDirectoryPath(), filesLocation)
        );
      }

      const sourceFilePath: string = this.sourceFile.getFilePathFromBaseDirectory();

      if (sourceFilePath.indexOf(path.sep) !== -1) {
        filesLocation = path.join(
          filesLocation,
          getDirectoryPath(sourceFilePath)
        );
      }

      filesLocation = replaceSourceDir(filesLocation, this.getSourceDir());

      if (!fs.existsSync(filesLocation)) {
        mkdirp.sync(filesLocation);
      }

      return filesLocation;
    }

    switch (this.getDefaultLocationForTestFiles()) {
      case DefaultLocationForTestFiles.SAME_AS_SOURCE_FILE:
        return this.sourceFile.getDirectoryPath();

      case DefaultLocationForTestFiles.PROJECT_ROOT:
        const sourceFilePath: string = this.sourceFile.getFilePathFromBaseDirectory();

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
      getDirectoryPath(this.sourceFile.getFilePathFromBaseDirectory())
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
}
