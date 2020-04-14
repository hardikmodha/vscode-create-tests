import {
  workspace,
  WorkspaceConfiguration,
  Uri,
  window,
  QuickPickItem,
} from "vscode";
import { SourceFile } from "../SourceFile";
import { Configuration } from "./Configuration";
import { IConfiguration } from "../types";

export class ConfigurationManager {
  static async getConfiguration(
    sourceFile: SourceFile,
    args: Uri
  ): Promise<Configuration | undefined> {
    const workspaceConfiguration: WorkspaceConfiguration = workspace.getConfiguration(
      "fileGenerator"
    );

    const configs = workspaceConfiguration.get<IConfiguration[]>("configs");

    if (!configs || !configs.length) {
      window.showErrorMessage(
        "Unable to get configurations, make sure to have an entry in 'fileGenerator.configs'."
      );
      return;
    }

    const extension = sourceFile.getExtension();

    const configByExtension = configs.find((x) =>
      x.supportedExtension.includes(extension)
    );

    if (!configByExtension) {
      configError();
      return;
    }

    let label: string | undefined = "";
    let config: IConfiguration | undefined = configByExtension;

    if (args instanceof Uri) {
      config = await getConfigQuickPick(configs);
      if (config) {
        label = await getTaskQuickPick(config);
      }
    } else {
      label = (args as string).toString();
    }

    if (!config) {
      configError();
      return;
    }

    return new Configuration(
      config,
      config.tasks && config.tasks.find((x) => x.label === label)
    );
  }
}
const configError = () => {
  window.showErrorMessage(
    "File extension not supported, to support the extension add an entry to 'fileGenerator.configs' and set 'supportedExtension' property."
  );
};

const getConfigQuickPick = async (configs: IConfiguration[]) => {
  let configsPickItemItems: QuickPickItem[] = configs.map((conf) => {
    return {
      label: conf.label,
      description: conf.description,
    } as QuickPickItem;
  });

  const configPicked = await window.showQuickPick(configsPickItemItems);
  if (configPicked) {
    return configs.find((x) => x.label === configPicked.label);
  }
  return;
};

const getTaskQuickPick = async (config: IConfiguration) => {
  if (!config || !config.tasks || !config.tasks.length) return;

  if (config.tasks.length === 1) return config.tasks[0].label;

  const taskPickItems = config.tasks.map((conf) => {
    return {
      label: conf.label,
      description: conf.description,
    } as QuickPickItem;
  });

  const taskPicked = await window.showQuickPick(taskPickItems);

  if (taskPicked) {
    return taskPicked.label;
  }

  return;
};
