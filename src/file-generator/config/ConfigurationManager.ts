import {
  workspace,
  WorkspaceConfiguration,
  Uri,
  window,
  QuickPickItem,
} from "vscode";
import { Configuration } from "./Configuration";
import { IConfiguration } from "../types";

export class ConfigurationManager {
  static async getConfiguration(args: Uri): Promise<Configuration | undefined> {
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

    const isUriInstance = args instanceof Uri;

    let taskLabel: string | undefined = "";
    let config: IConfiguration | undefined;

    if (isUriInstance) {
      config = await getConfigQuickPick(configs);
      if (config) {
        taskLabel = await getTaskQuickPick(config);
      }
    } else {
      taskLabel = args.toString();
      const configByLabel = configs.find((x) => x.label === taskLabel);
      if (configByLabel) {
        config = configByLabel;
      } else {
        config = configs.find((x) =>
          x.tasks.find((t) => t.label === taskLabel)
        );
      }
    }

    if (!config) {
      window.showErrorMessage(
        "Unable to find configurations, make sure to have a valid 'fileGenerator.configs' settings."
      );
      return;
    }

    const task =
      config.tasks && taskLabel
        ? config.tasks.find((x) => x.label === taskLabel)
        : undefined;

    const configuration = new Configuration(config, task);

    return configuration;
  }
}

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
