# serverless-typescript-local-module

`serverless-typescript-local-module` is a [serverless framework](https://www.serverless.com/) plugin that helps you directly inject local node modules to the modules of the project.

### Why is this needed?

[serverless-plugin-typescript](https://www.npmjs.com/package/serverless-plugin-typescript), doesn't follow symlinks when copying node modules from the build directory. The issue that occurs is that the local node module you are using won't get added to the package.

## How does it work?

This plugin simply does those steps for you

- Remove symlink from the node_module folder in your `.build` directory
- If it's a typescript local module builds it.
- Copies the module and it's node modules to the `.build` directory node modules
- Cleanups the typescript build directory

## Installation

Install the package from npm repository

```bash
npm i --save-dev serverless-typescript-local-module
```

Include the plugin after the `serverless-plugin-typescript` on your `serverless.yml` file.

```yml
plugins:
  - serverless-plugin-typescript
  - serverless-typescript-local-module
```

## Usage

```yml
custom:
  serverlessTypescriptModuleConfig:
    packager: 'npm'
  serverlessTypescriptLocalModule:
    - name: '@localDependency/shared'
      path: '../shared'
      isTypescriptModule: true
      tsConfigFile: 'tsconfig.json'
      buildCommand: build
```

```yml
custom:
  serverlessTypescriptModuleConfig:
    packager: 'npm'
  serverlessTypescriptLocalModule:
    - name: '@localDependency/shared'
      path: '../shared'
      isTypescriptModule: false
```

```yml
custom:
  serverlessTypescriptModuleConfig:
    packager: 'pnpm'
  serverlessTypescriptLocalModule:
    - name: '@localDependency/shared'
      path: '../shared'
      isTypescriptModule: true
      tsConfigFile: 'tsconfig.json'
```

```yml
custom:
  serverlessTypescriptModuleConfig:
    packager: 'pnpm'
  serverlessTypescriptLocalModule:
    - name: '@localDependency/shared'
      path: '../shared'
      isTypescriptModule: true
      buildCommand: build
      skipBuildForTs: true
```

```yml
custom:
  serverlessTypescriptModuleConfig:
    packager: 'pnpm'
  serverlessTypescriptLocalModule:
    - name: '@localDependency/shared'
      path: '../shared'
      isTypescriptModule: true
```

## Config

- packager (npm|pnpm) - Which packager to use for omiting dev dependencies

## Local modules definition

- Name: Your local module name
- Path: The path where this module is created
- isTypescriptModule (true|false) - Is the module a typescript one
- tsConfigFIle (not required - defaults to `tsconfig.json`) - The name of the typescript config file. This only is allowed when isTypescriptModule is set to true
- buildCommand (not required - defaults to `build`) - Which script to use to build the project
- skipBuildForTs (not required - defaults to `false`) - If the plugin should skip building the module if it's a typescript module

**NOTE: The plugin will fail if the build script isn't found**

## License

[MIT](https://choosealicense.com/licenses/mit/)
