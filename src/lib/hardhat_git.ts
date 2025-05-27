import pkg from '../../package.json';
import envPaths from 'env-paths';
import { HardhatPluginError } from 'hardhat/plugins';
import child_process from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { detect as detectPackageManager } from 'package-manager-detector';
import { simpleGit } from 'simple-git';

const DIRECTORY_BASE = envPaths(pkg.name).temp;

export class HardhatGitOrigin {
  public readonly directory: string;
  private readonly refMap: { [ref: string]: string } = {};

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
        if (await this.hasRef(directory)) {
          const clone = new HardhatGitClone(this, directory);

          if (await clone.isInitialized()) {
            clones.push(clone);
          }
        }
      }
    }

    return clones;
  }

  public async hasRef(ref: string) {
    try {
      // parseRef will revert if ref does not exist
      // as a side effect, successfully parsed refs are cached
      await this.parseRef(ref);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async checkout(ref: string = 'HEAD') {
    ref = await this.parseRef(ref);
    return new HardhatGitClone(this, ref);
  }

  private async parseRef(ref: string) {
    if (!this.refMap[ref]) {
      const parsedRef = await simpleGit(this.directory).revparse(ref);
      this.refMap[ref] = parsedRef;
      this.refMap[parsedRef] = parsedRef;
    }

    return this.refMap[ref];
  }
}

export class HardhatGitClone {
  public readonly origin: HardhatGitOrigin;
  public readonly ref: string;
  public readonly directory: string;
  private readonly successfulSetupIndicatorFile: string;

  constructor(origin: HardhatGitOrigin, ref: string = 'HEAD') {
    this.origin = origin;
    this.ref = ref;
    this.directory = path.resolve(DIRECTORY_BASE, ref);
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
      await git.fetch('origin', this.ref, { '--depth': 1 });
      await git.checkout(this.ref);
    } catch (error) {
      throw new HardhatPluginError(pkg.name, error as string);
    }
  }

  private async installDependencies(npmInstall?: string) {
    npmInstall ??= await this.inferNpmInstallCommand();

    const [packageManager, ...installCommand] = npmInstall.split(' ');

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
