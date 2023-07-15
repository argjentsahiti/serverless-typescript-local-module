const { workerData } = require('worker_threads');
const LocalModuleCopyUtility = require('../utilities/localModuleCopy.utility');

function copyLocalModule(data) {
  new LocalModuleCopyUtility(
    data.modulePath,
    data.servicePath,
    data.moduleName,
    data.isTypescriptModule,
    data.buildCommand,
    data.tsConfigFile,
  ).copy();

  process.exit(0);
}

copyLocalModule(workerData);
