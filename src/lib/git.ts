import pkg from '../../package.json';
import { HardhatPluginError } from 'hardhat/plugins';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import child_process from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { simpleGit } from 'simple-git';

export const deriveTemporaryDirectory = async (
  origin: string,
  ref: string = 'HEAD',
): Promise<string> => {
  const git = simpleGit(origin);
  ref = await git.revparse(ref);

  return path.resolve(os.tmpdir(), pkg.name, ref);
};

export const clone = async (origin: string, ref: string = 'HEAD') => {
  const tmpdir = await deriveTemporaryDirectory(origin, ref);
  const successfulSetupIndicatorFile = path.resolve(
    tmpdir,
    '.setup_successful',
  );

  const git = simpleGit(origin);
  ref = await git.revparse(ref);

  if (!(await exists(origin, ref))) {
    // delete the directory in case a previous setup failed
    await remove(origin, ref);
    await fs.promises.mkdir(tmpdir, { recursive: true });

    try {
      const git = simpleGit(tmpdir);
      await git.init();
      await git.addRemote('origin', origin);
      await git.fetch('origin', ref, { '--depth': 1 });
      await git.checkout(ref);

      child_process.spawnSync('npm', ['install'], {
        cwd: tmpdir,
        stdio: 'inherit',
      });

      await fs.promises.writeFile(successfulSetupIndicatorFile, '');
    } catch (error) {
      await remove(origin, ref);
      throw new HardhatPluginError(pkg.name, error as string);
    }
  }

  return tmpdir;
};

export const exists = async (origin: string, ref: string = 'HEAD') => {
  const tmpdir = await deriveTemporaryDirectory(origin, ref);
  const successfulSetupIndicatorFile = path.resolve(
    tmpdir,
    '.setup_successful',
  );

  return fs.existsSync(successfulSetupIndicatorFile);
};

export const remove = async (origin: string, ref: string = 'HEAD') => {
  const tmpdir = await deriveTemporaryDirectory(origin, ref);
  await fs.promises.rm(tmpdir, { recursive: true, force: true });
};

export const createHardhatRuntimeEnvironmentAtGitRef = async (
  hre: HardhatRuntimeEnvironment,
  ref: string = 'HEAD',
): Promise<HardhatRuntimeEnvironment> => {
  const tmpdir = await clone(hre.config.paths.root, ref);

  // TODO: fallback to local createHardhatRuntimeEnvironment function
  const { createHardhatRuntimeEnvironment } = await import(
    path.resolve(tmpdir, 'node_modules/hardhat/dist/src/hre')
  );

  const { findClosestHardhatConfig } = await import(
    path.resolve(
      tmpdir,
      'node_modules/hardhat/dist/src/internal/config-loading',
    )
  );

  const tmpConfigPath = await findClosestHardhatConfig(tmpdir);
  const tmpConfig = await import(tmpConfigPath);

  return await createHardhatRuntimeEnvironment(
    tmpConfig.default,
    { config: tmpConfigPath },
    tmpdir,
  );
};
