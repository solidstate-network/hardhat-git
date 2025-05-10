import pkg from '../../package.json';
import { HardhatGitOrigin } from '../lib/hardhat_git.js';
import { HardhatPluginError } from 'hardhat/plugins';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref: string;
  force: boolean;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const { ref, force } = args;
  const origin = new HardhatGitOrigin(hre.config.paths.root);
  const clone = await origin.checkout(ref);

  if (!force && (await clone.isInitialized())) {
    throw new HardhatPluginError(
      pkg.name,
      `Clone of ref ${ref} already initialized at ${clone.directory}.`,
    );
  }

  await clone.initialize();

  console.log(
    `Checked out ref ${clone.ref} and initialized clone at ${clone.directory}.`,
  );
};

export default action;
