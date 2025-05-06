import pkg from '../../package.json';
import { HardhatPluginError } from 'hardhat/plugins';
import child_process from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { simpleGit } from 'simple-git';

const DIRECTORY_BASE = path.resolve(os.tmpdir(), pkg.name);

export const deriveDirectory = async (
  origin: string,
  ref: string = 'HEAD',
): Promise<string> => {
  const git = simpleGit(origin);
  ref = await git.revparse(ref);

  return path.resolve(DIRECTORY_BASE, ref);
};

export const list = async (origin: string) => {
  const clones = [];

  if (fs.existsSync(DIRECTORY_BASE)) {
    const directories = (
      await fs.promises.readdir(DIRECTORY_BASE, { withFileTypes: true })
    )
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const directory of directories) {
      if (await exists(origin, directory)) {
        clones.push(directory);
      }
    }
  }

  return clones;
};

export const clone = async (origin: string, ref: string = 'HEAD') => {
  const directory = await deriveDirectory(origin, ref);
  const successfulSetupIndicatorFile = path.resolve(
    directory,
    '.setup_successful',
  );

  const git = simpleGit(origin);
  ref = await git.revparse(ref);

  if (!(await exists(origin, ref))) {
    // delete the directory in case a previous setup failed
    await remove(origin, ref);
    await fs.promises.mkdir(directory, { recursive: true });

    try {
      const git = simpleGit(directory);
      await git.init();
      await git.addRemote('origin', origin);
      await git.fetch('origin', ref, { '--depth': 1 });
      await git.checkout(ref);

      child_process.spawnSync('npm', ['install'], {
        cwd: directory,
        stdio: 'inherit',
      });

      await fs.promises.writeFile(
        successfulSetupIndicatorFile,
        new Date().getTime().toString(),
      );
    } catch (error) {
      await remove(origin, ref);
      throw new HardhatPluginError(pkg.name, error as string);
    }
  }

  return directory;
};

export const exists = async (origin: string, ref: string = 'HEAD') => {
  const directory = await deriveDirectory(origin, ref);
  const successfulSetupIndicatorFile = path.resolve(
    directory,
    '.setup_successful',
  );

  return fs.existsSync(successfulSetupIndicatorFile);
};

export const remove = async (origin: string, ref: string = 'HEAD') => {
  const directory = await deriveDirectory(origin, ref);
  await fs.promises.rm(directory, { recursive: true, force: true });
};
