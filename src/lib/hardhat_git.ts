import pkg from '../../package.json' with { type: 'json' };
import envPaths from 'env-paths';
import { HardhatPluginError } from 'hardhat/plugins';
import child_process from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { detect as detectPackageManager } from 'package-manager-detector';
import { simpleGit } from 'simple-git';

const DIRECTORY_BASE = envPaths(pkg.name).temp;

// track which package manager has been used to install dependencies for each rev
// reinstallation using different package managers is unsupported due to module resolution issues
// (npm, bun, and yarn appear to be compatible, but pnpm is not)
const packageManagerLock: { [directory: string]: string } = {};

export class HardhatGitOrigin {
  public readonly directory: string;
  private readonly revMap: { [rev: string]: string } = {};

  constructor(directory: string) {
    this.directory = directory;
  }

  public async list() {
    const clones = [];

    if (fs.existsSync(DIRECTORY_BASE)) {
      const directories = (
        await fs.promises.readdir(DIRECTORY_BASE, { withFileTypes: true })
      )
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const directory of directories) {
        if (await this.hasRev(directory)) {
          const clone = new HardhatGitClone(this, directory);

          if (await clone.isInitialized()) {
            clones.push(clone);
          }
        }
      }
    }

    return clones;
  }

  public async hasRev(rev: string) {
    try {
      // parseRev will revert if rev does not exist
      // as a side effect, successfully parsed revs are cached
      await this.parseRev(rev);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async checkout(rev: string = 'HEAD') {
    rev = await this.parseRev(rev);
    return new HardhatGitClone(this, rev);
  }

  private async parseRev(rev: string) {
    if (!this.revMap[rev]) {
      const parsedRev = await simpleGit(this.directory).revparse(rev);
      this.revMap[rev] = parsedRev;
      this.revMap[parsedRev] = parsedRev;
    }

    return this.revMap[rev];
  }
}

export class HardhatGitClone {
  public readonly origin: HardhatGitOrigin;
  public readonly rev: string;
  public readonly directory: string;
  private readonly successfulSetupIndicatorFile: string;

  constructor(origin: HardhatGitOrigin, rev: string = 'HEAD') {
    this.origin = origin;
    this.rev = rev;
    this.directory = path.resolve(DIRECTORY_BASE, rev);
    this.successfulSetupIndicatorFile = path.resolve(
      this.directory,
      '.setup_successful',
    );
  }

  public async isInitialized() {
    return fs.existsSync(this.successfulSetupIndicatorFile);
  }

  public async initialize(npmInstall?: string) {
    // delete the directory in case a clone already exists or
    // a previous setup failed
    await this.remove();
    await fs.promises.mkdir(this.directory, { recursive: true });

    await this.checkout();
    await this.installDependencies(npmInstall);
    await this.writeIndicatorFile();
  }

  private async checkout() {
    try {
      const git = simpleGit(this.directory);
      await git.init();
      await git.addRemote('origin', this.origin.directory);
      await git.fetch('origin', this.rev, { '--depth': 1 });
      await git.checkout(this.rev);
    } catch (error) {
      throw new HardhatPluginError(pkg.name, error as string);
    }
  }

  private async installDependencies(npmInstall?: string) {
    npmInstall ??= await this.inferNpmInstallCommand();

    const [packageManager, ...installCommand] = npmInstall.split(' ');

    packageManagerLock[this.directory] ??= packageManager;

    if (packageManagerLock[this.directory] !== packageManager) {
      throw new HardhatPluginError(
        pkg.name,
        `unable to reinstall dependencies with multiple package managers: ${packageManagerLock[this.directory]}, ${packageManager}`,
      );
    }

    try {
      child_process.spawnSync(packageManager, installCommand, {
        cwd: this.directory,
        stdio: 'inherit',
      });
    } catch (error) {
      throw new HardhatPluginError(pkg.name, error as string);
    }
  }

  private async writeIndicatorFile() {
    try {
      await fs.promises.writeFile(
        this.successfulSetupIndicatorFile,
        new Date().getTime().toString(),
      );
    } catch (error) {
      throw new HardhatPluginError(pkg.name, error as string);
    }
  }

  public async remove() {
    await fs.promises.rm(this.directory, { recursive: true, force: true });
  }

  public async inferPackageManager() {
    const result = await detectPackageManager({ cwd: this.directory });
    return result ? result.name : 'npm';
  }

  public async inferNpmInstallCommand() {
    const packageManager = await this.inferPackageManager();
    return `${packageManager} install`;
  }
}
