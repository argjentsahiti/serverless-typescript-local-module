const PluginConfigValidator = require('./validators/pluginConfig.validator');
const path = require('path');
const { Worker } = require('worker_threads');
const fs = require('fs-extra');

class ServerlessTypescriptLocalModule {
  constructor(serverless) {
    this.serverless = serverless;
    this.hooks = {
      'before:package:createDeploymentArtifacts': this.beforeCreateArtifact.bind(this),
    };
  }

  async beforeCreateArtifact() {
    const service = this.serverless.service;
    const localDependencies = service.custom['serverlessTypescriptLocalModule'];
    const globalConfig = service.custom['serverlessTypescriptModuleConfig'];

    PluginConfigValidator.validate(localDependencies);

    const packager = globalConfig?.packager ? globalConfig.packager : 'npm';

    await Promise.all(
      localDependencies.map((localDependency) => {
        const modulePath = path.normalize(process.env.PWD + '/' + localDependency.path);
        const tsConfigFile = localDependency.tsConfigFile
          ? localDependency.tsConfigFile
          : 'tsconfig.json';
        const buildCommand = localDependency.buildCommand ? localDependency.buildCommand : 'build';

        return this.copyLocalModule(
          modulePath,
          process.env.PWD,
          localDependency.name,
          !!localDependency.isTypescriptModule,
          tsConfigFile,
          buildCommand,
          !!localDependency.skipBuildForTs,
          packager,
        );
      }),
    );
  }

  copyLocalModule(
    modulePath,
    servicePath,
    moduleName,
    isTypescriptModule,
    tsConfigFile,
    buildCommand,
    skipBuildForTs = false,
    packager = 'npm',
  ) {
    return new Promise((resolve, reject) => {
      const data = {
        modulePath,
        servicePath,
        moduleName,
        isTypescriptModule,
        tsConfigFile,
        buildCommand,
        skipBuildForTs,
        packager,
      };
      const worker = new Worker(path.join(__dirname, '/workers/copyModule.worker.js'), {
        workerData: data,
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code === 0) {
          resolve();
        }
        reject(new Error(`Copy node modules script stopped with exit code ${code}`));
      });
    });
  }

  cleanup() {
    const service = this.serverless.service;
    const localDependencies = service.custom['serverlessTypescriptLocalModule'];

    localDependencies.forEach((localDependency) => {
      if (localDependency.isTypescriptModule) {
        const modulePath = path.normalize(process.env.PWD + '/' + localDependency.path);
        const tsConfigFile = localDependency.tsConfigFile
          ? localDependency.tsConfigFile
          : 'tsconfig.json';

        const tsConfig = require(path.join(modulePath, tsConfigFile));
        const buildDirectory = path.join(modulePath, tsConfig.compilerOptions.outDir);

        fs.removeSync(buildDirectory);
      }
    });
  }
}

module.exports = ServerlessTypescriptLocalModule;
