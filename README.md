Forked from [hardikmodha/vscode-create-tests](https://github.com/HardikModha/vscode-file-generator/blob/master/README.md)

Modified to quickly create files.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/HardikModha/vscode-file-generator/blob/master/LICENSE)

### Motivation

Needed a file generator to create a file and run task on it.

## Features

- Create file from the file explorer or short cut.
- Specifying the default location to keep the new files. Currently supports
  1.  Location same as the file location.
  2.  Project root
- If for some reasons default locations don't work for you. Don't worry, you can specify the custom location as well.
- Custom name for the file directory.
- Ability to specify the various template(s) to use for test files for the different languages.
- Automatically switching to test cases when you create them.
- pass argument to terminal open file creation or if file exist

## Configuration options

Accepts array of configurations with following options

```
        "fileGenerator.configs": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "defaultLocationForFiles": {
                "type": "string",
                "default": "same location as source file",
                "enum": [
                  "same location as source file",
                  "project root"
                ],
                "description": "Where to keep the created new files?"
              },
              "label": {
                "type": "string",
                "description": "Name of task"
              },
              "description": {
                "type": "string"
              },
              "sourceDir": {
                "type": "string",
                "default": "src",
                "description": "Name of directory which contains all source files. This directory is not created when generating the directory structure for the test file."
              },
              "directoryName": {
                "type": "string",
                "description": "Name of the new directory."
              },
              "customFilesLocation": {
                "type": "string",
                "description": "Set this property in case you want to specify the custom location for new files."
              },
              "filesSuffix": {
                "type": "string",
                "description": "Suffix to use for the new files."
              },
              "fileSuffixType": {
                "type": "string",
                "enum": [
                  "replace extension",
                  "extend extension",
                  "append to file name"
                ],
                "description": "If set to 'replace extension' file extension will be replaced with 'filesSuffix',if set to 'extend extension' file extension will be extended with 'filesSuffix' eg. .ts => .test.ts, if set to 'append to file name' 'filesSuffix' will be appended to file name."
              },
              "shouldSwitchToFile": {
                "type": "boolean",
                "default": true,
                "description": "Whether to switch to the new file or not after creating it."
              },
              "template": {
                "type": [
                  "array",
                  "object"
                ],
                "description": "Template to append to newly created file."
              },
              "useForwardSlash": {
                "type": "boolean",
                "default": true,
                "description": "If set to true will make backslash to forward slash, useful for windows and jest."
              },
              "supportedExtension": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "default": [
                  "ts",
                  "tsx",
                  "js",
                  "jsx"
                ],
                "description": "Test supported Extension"
              },
              "watchCommands": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "default": [
                  "--watch",
                  "dotnet watch"
                ],
                "description": "When file created for the first time the associated tasks should not run,unless a watch command detected."
              },
              "tasks": {
                "type": "array",
                "items": {
                  "type": "object",
                  "title": "task",
                  "properties": {
                    "label": {
                      "type": "string",
                      "description": "Name of task"
                    },
                    "description": {
                      "type": "string"
                    },
                    "args": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "title": "task"
                      },
                      "description": "Arguments to pass to task"
                    },
                    "checkIfArgPathExist": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "Will check if path exist for an arguments, the argument and path should be in one line => ['--config=some path to config'], if the path provided for --config not fund --config option will be removed from command. And error message displayed."
                    },
                    "runTaskOnFileCreation": {
                      "type": "boolean",
                      "default": true,
                      "description": "If true task will run when file created, else it will only run when file already exist"
                    },
                    "useForwardSlash": {
                      "type": "boolean",
                      "default": true,
                      "description": "Will convert back slash to forward slash, Required for jest when running in windows"
                    },
                    "usePathFromBaseDirectory": {
                      "type": "boolean",
                      "default": true,
                      "description": "When set to true the workspace root path will be removed, Required for jest"
                    },
                    "shouldSwitchToFile": {
                      "type": "boolean",
                      "default": true,
                      "description": "Whether to switch to the new file or not."
                    },
                    "terminalInstanceType": {
                      "type": "string",
                      "default": "label",
                      "enum": [
                        "label",
                        "command",
                        "new"
                      ],
                      "description": "If set to 'label' created terminal instance will be reused by task with label name, if set to 'command' created terminal will be reused by task with same arguments and commands, if set 'new' terminal will be created each time task runs."
                    },
                    "command": {
                      "type": "string",
                      "default": "jest"
                    },
                    "default": {
                      "type": "boolean",
                      "description": "When unable to detect task, will run task with default set to true"
                    }
                  },
                  "required": [
                    "label"
                  ]
                },
                "description": "Whether to switch to the story file or not after creating it."
              }
            },
            "required": [
              "label"
            ]
          }
        }
```

## Supported templates

For this extension, The templates can vary from as simple as

```
"import { ${moduleName} } from '${modulePath}';"
```

to

```
[
    "import { ${moduleName} } from '${modulePath}';"
    "",
    "describe('${moduleName}', () => {",
    "\tit('', () => {",
    "",
    "\t})",
    "})"
]
```

## License

[MIT](LICENSE)
