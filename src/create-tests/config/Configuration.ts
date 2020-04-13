import * as vscode from "vscode";
import { WorkspaceConfiguration } from "vscode";
import { IConfiguration, TestTask } from "../types";
import { SourceFile } from "../SourceFile";

import {
  DEFAULT_TEST_FILES_SUFFIX,
  DefaultLocationForTestFiles,
  DEFAULT_DIR_NAME,
} from "../constants";

/**
 * A class used to hold the extension configurations. It also defines the getters to read the configuration.
 */
export class Configuration {
  private defaultConfiguration: IConfiguration = {
    defaultLocationForFiles: DefaultLocationForTestFiles.SAME_AS_SOURCE_FILE,
    directoryName: DEFAULT_DIR_NAME,
    customTestFilesLocation: "",
    filesSuffix: DEFAULT_TEST_FILES_SUFFIX,
    fileSuffixType: "append",
    shouldSwitchToFile: true,
    sourceDir: "src",
    supportedExtension: [],
    tasks: [],
    watchCommands: [],
    configs: [],
  };

  private workspaceConfig: WorkspaceConfiguration;

  constructor(config: WorkspaceConfiguration, extension?: string) {
    this.workspaceConfig = config;
    // extension used for testRunner only
    if (!extension) return;
    const configByExtension = this.getConfigs().find((x) =>
      x.supportedExtension.includes(extension)
    );
    if (!configByExtension) {
      vscode.window.showErrorMessage(
        "File extension not supported, to support the extension add an entry to testRunner.configs."
      );
    } else {
      this.defaultConfiguration = {
        ...this.defaultConfiguration,
        ...configByExtension,
      };
    }
  }

  /**
   * Helper method to return the default value. Handles the cases of empty string.
   */
  private getConfigValue<T>(key: string, defaultValue: T) {
    const value = this.workspaceConfig.get<T>(key);

    return value ? value : defaultValue;
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

  getTestDirectoryName(): string {
    return this.getConfigValue(
      "directoryName",
      this.defaultConfiguration.directoryName
    );
  }

  getConfigs() {
    return this.getConfigValue("configs", this.defaultConfiguration.configs);
  }

  getTestFilesSuffix(): string {
    return this.getConfigValue(
      "filesSuffix",
      this.defaultConfiguration.filesSuffix
    );
  }

  getTestFileSuffixType() {
    return this.getConfigValue(
      "fileSuffixType",
      this.defaultConfiguration.fileSuffixType
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
