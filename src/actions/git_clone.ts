import pkg from '../../package.json' with { type: 'json' };
import { HardhatGitOrigin } from '../lib/hardhat_git.js';
import { HardhatPluginError } from 'hardhat/plugins';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  rev: string;
  npmInstall?: string;
  force: boolean;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const { rev, force } = args;
  const npmInstall = args.npmInstall ?? hre.config.git.npmInstall;

  const origin = new HardhatGitOrigin(hre.config.paths.root);
  const clone = await origin.checkout(rev);

  if (!force && (await clone.isInitialized())) {
    throw new HardhatPluginError(
      pkg.name,
      `Clone of rev ${rev} already initialized at ${clone.directory}.`,
    );
  }

  await clone.initialize(npmInstall);

  console.log(
    `Checked out rev ${clone.rev} and initialized clone at ${clone.directory}.`,
  );
};

export default action;
