import { IConfiguration, NewFileTask } from "../types";
import { SourceFile } from "../SourceFile";

import { DefaultLocationForNewFiles } from "../constants";

/**
 * A class used to hold the extension configurations. It also defines the getters to read the configuration.
 */
export class Configuration {
  private defaultConfiguration: IConfiguration = {
    defaultLocationForFiles: DefaultLocationForNewFiles.SAME_AS_SOURCE_FILE,
    directoryName: "",
    customFilesLocation: "",
    shouldSwitchToFile: true,
    sourceDir: "src",
    supportedExtension: [],
    tasks: [],
    configs: [],
  };
  task?: NewFileTask;

  constructor(config: IConfiguration, task?: NewFileTask) {
    this.defaultConfiguration = {
      ...this.defaultConfiguration,
      ...config,
    };
    this.task = task;
  }

  getTemplate() {
    return this.defaultConfiguration.template;
  }

  getTasks(): NewFileTask[] {
    return this.defaultConfiguration.tasks;
  }

  getDefaultLocationForNewFiles(): string {
    return this.defaultConfiguration.defaultLocationForFiles;
  }

  getCustomLocationForNewFiles(): string {
    return this.defaultConfiguration.customFilesLocation;
  }

  getDirectoryName(): string {
    return this.defaultConfiguration.directoryName;
  }

  getConfigs() {
    return this.defaultConfiguration.configs;
  }

  getNewFilesSuffix() {
    return this.defaultConfiguration.filesSuffix;
  }

  getFileSuffixType() {
    return this.defaultConfiguration.fileSuffixType;
  }

  shouldSwitchToFile(): boolean {
    return this.defaultConfiguration.shouldSwitchToFile;
  }

  getSourceDir(): string {
    return this.defaultConfiguration.sourceDir;
  }

  getSupportedExtension() {
    return this.defaultConfiguration.supportedExtension;
  }

  isValidExtension(sourceFile: SourceFile) {
    const ext = sourceFile.getExtension();
    const extensions = this.getSupportedExtension();
    return extensions.indexOf(ext) !== -1;
  }

  getTask() {
    const tasks = this.getTasks();
    let task = this.task;

    if (!task) {
      task = tasks.find((x) => x.default);
    }

    if (!task) {
      return;
    }

    // set defaults
    if (task.useForwardSlash === undefined) task.useForwardSlash = true;
    if (task.shouldSwitchToFile === undefined) task.shouldSwitchToFile = true;
    if (task.runTaskOnFileCreation === undefined)
      task.runTaskOnFileCreation = true;
    if (task.terminalInstanceType === undefined)
      task.terminalInstanceType = "label";

    return task;
  }
}
