import pkg from '../../package.json';
import { HardhatPluginError } from 'hardhat/plugins';
import child_process from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { simpleGit } from 'simple-git';

const DIRECTORY_BASE = path.resolve(os.tmpdir(), pkg.name);

export class Origin {
  private readonly origin: string;
  private readonly refMap: { [ref: string]: string } = {};

  constructor(origin: string) {
    this.origin = origin;
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
        const clone = new Clone(this.origin, directory);

        if (await clone.exists()) {
          clones.push(clone);
        }
      }
    }

    return clones;
  }

  public async checkout(ref: string = 'HEAD') {
    ref = await this.parseRef(ref);
    return new Clone(this.origin, ref);
  }

  private async parseRef(ref: string) {
    this.refMap[ref] ??= await simpleGit(this.origin).revparse(ref);
    return this.refMap[ref];
  }
}

export class Clone {
  public readonly origin: string;
  public readonly ref: string;
  public readonly directory: string;
  private readonly successfulSetupIndicatorFile: string;

  constructor(origin: string, ref: string = 'HEAD') {
    this.origin = origin;
    this.ref = ref;
    this.directory = path.resolve(DIRECTORY_BASE, ref);
    this.successfulSetupIndicatorFile = path.resolve(
      this.directory,
      '.setup_successful',
    );
  }

  public async exists() {
    return fs.existsSync(this.successfulSetupIndicatorFile);
  }

  public async clone(npmInstall: string = 'npm install') {
    // delete the directory in case a clone already exists or
    // a previous setup failed
    await this.remove();
    await fs.promises.mkdir(this.directory, { recursive: true });

    try {
      const git = simpleGit(this.directory);
      await git.init();
      await git.addRemote('origin', this.origin);
      await git.fetch('origin', this.ref, { '--depth': 1 });
      await git.checkout(this.ref);

      const [packageManager, ...installCommand] = npmInstall.split(' ');

      child_process.spawnSync(packageManager, installCommand, {
        cwd: this.directory,
        stdio: 'inherit',
      });

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
}
