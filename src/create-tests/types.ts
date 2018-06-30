import {DefaultLocationForTestFiles} from "./constants";

export interface IConfiguration {
    testFilesSuffix: string;
    testDirectoryName: string;
    customTestFilesLocation: string;
    defaultLocationForTestFiles: DefaultLocationForTestFiles;
    shouldSwitchToTestFile: boolean;
    sourceDir: string;
}

export type Template = string[] | {[key: string]: string[]};