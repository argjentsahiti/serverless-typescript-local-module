const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class NpmScriptRunnerUtility {
  constructor(directory) {
    if (!directory || !fs.existsSync(directory)) {
      throw new Error('Invalid package json path');
    }

    this.directory = directory;
    this.packageJsonPath = path.join(this.directory, 'package.json');
  }

  run = (buildCommand) => {
    const packageJsonContent = JSON.parse(fs.readFileSync(this.packageJsonPath).toString('utf-8'));
    const scripts = packageJsonContent['scripts'];

    if (!Object.keys(scripts).includes(buildCommand)) {
      throw new Error(`Script named "${buildCommand}" not found in ${this.directory}`);
    }

    execSync(`npm run ${buildCommand}`, { cwd: this.directory });
  };
}

module.exports = NpmScriptRunnerUtility;
