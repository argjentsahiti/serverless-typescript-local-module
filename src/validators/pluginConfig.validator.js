const fs = require('fs');
const path = require('path');

class PluginConfigValidator {
  static validate = (config) => {
    if (!config) {
      throw new Error("Plugin config wasn't found");
    }

    if (!Array.isArray(config) || !config?.length) {
      throw new Error('Invalid configuration for serverless-typescript-local-module');
    }

    config.forEach((localDependency) => {
      if (!localDependency.name) {
        throw new Error('No name defined for local dependency');
      }

      if (!localDependency.path) {
        throw new Error(`Path not defined in ${localDependency.name}`);
      }

      const localDependencyFullPath = path.normalize(process.cwd() + '/' + localDependency.path);

      if (!fs.existsSync(localDependencyFullPath)) {
        throw new Error(`Path ${localDependency.path} for ${localDependency.name} doesn't exist`);
      }
    });
  };
}

module.exports = PluginConfigValidator;
