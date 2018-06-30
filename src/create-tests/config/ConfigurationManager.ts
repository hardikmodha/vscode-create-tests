import {workspace} from 'vscode';
import {Configuration} from './Configuration';
import {SourceFile} from '../SourceFile';

export class ConfigurationManager {
    static getConfiguration(sourceFile: SourceFile): Configuration {
        return new Configuration(workspace.getConfiguration('createTests'), sourceFile);
    }
}