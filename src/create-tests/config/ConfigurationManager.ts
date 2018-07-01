import {workspace} from "vscode";
import {SourceFile} from "../SourceFile";
import {Configuration} from "./Configuration";

export class ConfigurationManager {
    static getConfiguration(sourceFile: SourceFile): Configuration {
        return new Configuration(workspace.getConfiguration("createTests"), sourceFile);
    }
}
