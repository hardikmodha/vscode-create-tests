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
            "userInputPrompt": {
              "type": "array",
              "items": {
                "type": [
                  "object",
                  "array"
                ],
                "items": {
                  "type": "object",
                  "properties": {
                    "label": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    }
                  }
                },
                "properties": {
                  "label": {
                    "type": "string"
                  },
                  "description": {
                    "type": "string"
                  }
                }
              },
              "description": "Will show user input prompt to give a choice of options. for single prompt use array: [{ \"label\": \"--coverage\" }] , for In Sequence prompts use multi dimensional array: [[{ \"label\":\"--coverage\" }],[{ \"label\": \"--watch\" }]]"
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
            "shouldSwitchTerminalToCwd": {
              "type": "boolean",
              "default": false,
              "description": "Whether to switch terminal to cwd."
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

## Task Variables

This extension supports [vscode predefined variables](https://code.visualstudio.com/docs/editor/variables-reference) as well as following:

- \${targetFile}
- \${relativeTargetFile}
- \${relativeTargetFileDirname}
- \${targetFileDirname}
- \${targetFileExtname}
- \${targetFileBasename}
- \${targetFileBasenameNoExtension}

These variables can only be used with task arguments.

## Config Example

setting.json

```
{
  "fileGenerator.configs": [
    {
      "tasks": [
        {
          "terminalInstanceType": "label",
          "runTaskOnFileCreation": false,
          "label": "test current file",
          "command": "jest",
          "userInputPrompt": [{ "label": "--coverage" }, { "label": "--watch" }],
          "args": [" ${targetFile} --collectCoverageOnlyFrom=${targetFile}"]
        }
      ],

      "template": ["import { ${moduleName} } from '${modulePath}';"],
      "label": "Jest Tests",
      "fileSuffixType": "extend extension",
      "filesSuffix": "test",
      "directoryName": "__tests__",
      "supportedExtension": ["ts", "tsx", "js", "jsx"],
      "defaultLocationForFiles": "same location as source file",
      "description": "Jest Tests Creator"
    },
    {
      "label": "C# Tests",
      "fileSuffixType": "append to file name",
      "supportedExtension": ["cs"],
      "directoryName": "Tests",
      "filesSuffix": "Tests",
      "testRunner.customLocationForFiles": "my-test"
    },
    {
      "label": "Story File Create",
      "fileSuffixType": "extend extension",
      "supportedExtension": ["tsx"],
      "directoryName": "story",
      "filesSuffix": "story"
    }
  ]
}


```

keybindings.json

```
{
  {
    "key": "f7",
    "command": "fileGenerator.run",
    "args": "test current file"
  }
},
{
  {
    "key": "f8",
    "command": "fileGenerator.run",
    "args": "C# Tests"
  }
},
{
  {
    "key": "f9",
    "command": "fileGenerator.run",
    "args": "Story File Create"
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
