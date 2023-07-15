const PluginConfigValidator = require('./validators/pluginConfig.validator');
const path = require('path');
const { Worker } = require('worker_threads');

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
    PluginConfigValidator.validate(localDependencies);

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
  ) {
    return new Promise((resolve, reject) => {
      const data = {
        modulePath,
        servicePath,
        moduleName,
        isTypescriptModule,
        tsConfigFile,
        buildCommand,
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
}

module.exports = ServerlessTypescriptLocalModule;
