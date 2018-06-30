import * as fs from 'fs';
import * as path from 'path';

export const getDirectoryPath = (filePath: string): string => {
    const splitPath: string[] = filePath.split(path.sep);
    splitPath.pop(); // Remove the file name

    return path.isAbsolute(filePath) ? path.join(path.sep, ...splitPath) : path.join(...splitPath);
};

export const isDirectory = (filePath: string): boolean => {
    return fs.lstatSync(filePath).isDirectory();
};

export const isFile = (filePath: string): boolean => {
    return fs.lstatSync(filePath).isFile();
};

export const replaceSourceDir = (filePath: string, sourceDir: string): string => {
    return filePath.replace(`${path.sep}${sourceDir}${path.sep}`, path.sep);
};