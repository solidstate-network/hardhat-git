import pkg from '../../package.json' with { type: 'json' };
import { HardhatGitOrigin } from './hardhat_git.js';
import { findDependencyPackageJson } from '@nomicfoundation/hardhat-utils/package';
import { HardhatPluginError } from 'hardhat/plugins';
import type { HardhatConfig, HardhatUserConfig } from 'hardhat/types/config';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
import path from 'node:path';

export const createHardhatRuntimeEnvironmentAtGitRev = async (
  originConfig: HardhatConfig,
  rev: string = 'HEAD',
  plugins?: HardhatUserConfig['plugins'],
): Promise<HardhatRuntimeEnvironment> => {
  const origin = new HardhatGitOrigin(originConfig.paths.root);
  const clone = await origin.checkout(rev);

  if (!(await clone.isInitialized())) {
    await clone.initialize(originConfig.git.npmInstall);
  }

  const { directory } = clone;

  const packageJsonPath = await findDependencyPackageJson(directory, 'hardhat');

  if (!packageJsonPath) {
    throw new HardhatPluginError(
      pkg.name,
      `no Hardhat installation found at git revision ${rev}`,
    );
  }

  const { default: packageJson } = await import(packageJsonPath);

  const { createHardhatRuntimeEnvironment } = await import(
    path.resolve(path.dirname(packageJsonPath), packageJson.exports['./hre'])
  );

  const { findClosestHardhatConfig } = await import(
    path.resolve(
      path.dirname(packageJsonPath),
      'dist/src/internal/config-loading',
    )
  );

  const configPath: string = await findClosestHardhatConfig(directory);
  const config: HardhatUserConfig = await import(configPath);

  if (plugins && plugins.length) {
    config.plugins ??= [];
    config.plugins.push(...plugins);
  }

  return await createHardhatRuntimeEnvironment(
    config,
    { config: configPath },
    directory,
  );
};
