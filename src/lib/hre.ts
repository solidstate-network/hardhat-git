import { HardhatGitOrigin } from './hardhat_git.js';
import type { HardhatUserConfig } from 'hardhat/config';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import path from 'node:path';

export const createHardhatRuntimeEnvironmentAtGitRef = async (
  hre: Pick<HardhatRuntimeEnvironment, 'config'>,
  ref: string = 'HEAD',
  npmInstall?: string,
): Promise<HardhatRuntimeEnvironment> => {
  const origin = new HardhatGitOrigin(hre.config.paths.root);
  const clone = await origin.checkout(ref);

  if (!(await clone.isInitialized())) {
    await clone.initialize();
  }

  const { directory } = clone;

  // TODO: fallback to local createHardhatRuntimeEnvironment function
  const { createHardhatRuntimeEnvironment } = await import(
    path.resolve(directory, 'node_modules/hardhat/dist/src/hre')
  );

  const { findClosestHardhatConfig } = await import(
    path.resolve(
      directory,
      'node_modules/hardhat/dist/src/internal/config-loading',
    )
  );

  const configPath: string = await findClosestHardhatConfig(directory);
  const config: HardhatUserConfig = (await import(configPath)).default;

  return await createHardhatRuntimeEnvironment(
    config,
    { config: configPath },
    directory,
  );
};
