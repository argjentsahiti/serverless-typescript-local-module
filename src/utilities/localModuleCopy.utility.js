const fs = require('fs-extra');
const path = require('path');
const NpmScriptRunner = require('./npmScriptRunner.utility.js');
const { execSync } = require('child_process');
class LocalModuleCopyUtility {
  constructor(
    moduleDirectory,
    serviceDirectory,
    name,
    isTypescriptModule,
    buildCommand,
    tsConfigFile,
  ) {
    if (!fs.existsSync(moduleDirectory)) {
      throw new Error('Invalid moduleDirectory directory');
    }

    if (!fs.existsSync(serviceDirectory)) {
      throw new Error('invalid serviceDirectory directory');
    }

    this.moduleDirectory = moduleDirectory;
    this.serviceDirectory = serviceDirectory;
    this.name = name;
    this.isTypescriptModule = isTypescriptModule;
    this.buildCommand = buildCommand;
    this.tsConfigFile = tsConfigFile;
  }

  copy = () => {
    let sourceDir = this.moduleDirectory;

    if (this.isTypescriptModule) {
      const npmScriptRunner = new NpmScriptRunner(this.moduleDirectory);
      const tsConfig = require(path.join(this.moduleDirectory, this.tsConfigFile));
      npmScriptRunner.run(this.buildCommand);
      sourceDir = path.join(this.moduleDirectory, tsConfig.compilerOptions.outDir);
    }

    const destDir = path.join(this.serviceDirectory, '.build', 'node_modules', this.name);
    fs.removeSync(destDir);
    fs.ensureDirSync(destDir);
    fs.copySync(sourceDir, destDir);

    if (this.isTypescriptModule) {
      fs.copySync(
        path.join(this.moduleDirectory, 'node_modules'),
        path.join(sourceDir, 'node_modules'),
        {
          dereference: true,
        },
      );

      fs.copySync(
        path.join(this.moduleDirectory, 'package.json'),
        path.join(destDir, 'package.json'),
      );
    }
    execSync('npm prune --omit=dev', { cwd: destDir });
  };
}

module.exports = LocalModuleCopyUtility;
