import { Configuration } from "file-generator/config/Configuration";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { SourceFile } from "./SourceFile";
import {
  getDirectoryPath,
  replaceSourceDir,
  getFileName,
  isNewDirectory,
} from "./utils";
import { DefaultLocationForNewFiles } from "./constants";
import mkdirp = require("mkdirp");

class NewFileHelper {
  sourceFile!: SourceFile;
  config!: Configuration;
  constructor(config: Configuration, sourceFile: SourceFile) {
    this.config = config;
    this.sourceFile = sourceFile;
  }
  /**
   * This method reads the configuration and based on that returns the path of directory inside which file
   * should be created. First it checks whether the `customLocationForFiles` is set or not. If the configuration
   * is absent then it reads the `defaultLocationForFiles` and based on that returns the directory path.
   */
  getFilesLocation(): string {
    let filesLocation: string = this.config.getCustomLocationForNewFiles();

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

      filesLocation = replaceSourceDir(
        filesLocation,
        this.config.getSourceDir()
      );

      return filesLocation;
    }

    switch (this.config.getDefaultLocationForNewFiles()) {
      case DefaultLocationForNewFiles.SAME_AS_SOURCE_FILE:
        let localFilePath: string = this.sourceFile.getDirectoryPath();

        if (
          !this.isTestFile(this.sourceFile) &&
          isNewDirectory(this.config.getDirectoryName(), localFilePath)
        ) {
          localFilePath = path.join(
            localFilePath,
            this.config.getDirectoryName()
          );
        }

        return localFilePath;

      case DefaultLocationForNewFiles.PROJECT_ROOT:
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
      this.config.getDirectoryName(),
      getDirectoryPath(this.sourceFile.getRelativeFileDirname())
    );

    directoryPath = replaceSourceDir(directoryPath, this.config.getSourceDir());

    if (!fs.existsSync(directoryPath)) {
      mkdirp.sync(directoryPath);
    }

    return directoryPath;
  }

  isTestFile(sourceFile: SourceFile) {
    const ext =
      this.config.getNewFilesSuffix() + "." + sourceFile.getExtension();
    return sourceFile.getName().endsWith(ext);
  }

  getParentFileName(sourceFile: SourceFile) {
    const fileName = sourceFile.getNameWithoutExtension();
    const originalFile = fileName.replace(
      "." + this.config.getNewFilesSuffix(),
      ""
    );
    return originalFile + "." + sourceFile.getExtension();
    // const parentFile =  this.sourceFile.getName().;
  }
  getParentSourceFile(sourceFile: SourceFile) {
    const parentDir = sourceFile
      .getDirectoryPath()
      .replace(this.config.getDirectoryName(), "");
    const filePath = path.join(parentDir, this.getParentFileName(sourceFile));
    return new SourceFile(vscode.Uri.file(filePath));
  }
  getFilesDirectory() {
    let newDirPath = this.getFilesLocation();

    if (isNewDirectory(this.config.getDirectoryName(), newDirPath)) {
      const newDirName = this.config.getDirectoryName();
      newDirPath = path.join(newDirPath, newDirName);
    }
    return newDirPath;
  }
  getSourceFile() {
    return new SourceFile(vscode.Uri.file(this.getFileAbsolutePath()));
  }

  getFileAbsolutePath() {
    let newDirPath = this.getFilesLocation();

    if (
      !this.isTestFile(this.sourceFile) &&
      !isNewDirectory(this.config.getDirectoryName(), newDirPath)
    ) {
      const newDirName = this.config.getDirectoryName();
      newDirPath = path.join(newDirPath, newDirName);
    }

    const fileName = this.isTestFile(this.sourceFile)
      ? this.sourceFile.getName()
      : getFileName(this.sourceFile, this.config);
    const newFilePath = path.join(newDirPath, fileName);

    return newFilePath;
  }
}
export { NewFileHelper };
