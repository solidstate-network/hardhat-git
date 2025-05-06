import pkg from '../../package.json';
import { HardhatPluginError } from 'hardhat/plugins';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import child_process from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { simpleGit } from 'simple-git';

export const getTmpHreAtGitRef = async (
  hre: HardhatRuntimeEnvironment,
  ref?: string,
): Promise<HardhatRuntimeEnvironment> => {
  if (!ref) {
    return hre;
  }

  const git = simpleGit(hre.config.paths.root);
  ref = await git.revparse(ref);

  const tmpdir = path.resolve(os.tmpdir(), pkg.name, ref);
  const successfulSetupIndicatorFile = path.resolve(
    tmpdir,
    '.setup_successful',
  );

  if (!fs.existsSync(successfulSetupIndicatorFile)) {
    // delete the directory in case a previous setup failed
    await fs.promises.rm(tmpdir, { recursive: true, force: true });
    await fs.promises.mkdir(tmpdir, { recursive: true });

    try {
      await git.cwd(tmpdir);
      await git.init();
      await git.addRemote('origin', hre.config.paths.root);
      await git.fetch('origin', ref, { '--depth': 1 });
      await git.checkout(ref);

      child_process.spawnSync('npm', ['install'], {
        cwd: tmpdir,
        stdio: 'inherit',
      });

      await fs.promises.writeFile(successfulSetupIndicatorFile, '');
    } catch (error) {
      await fs.promises.rm(tmpdir, { recursive: true, force: true });
      throw new HardhatPluginError(pkg.name, error as string);
    }
  }

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
