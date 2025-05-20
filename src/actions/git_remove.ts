import pkg from '../../package.json';
import { HardhatGitOrigin } from '../lib/hardhat_git.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref: string;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const { ref } = args;

  const origin = new HardhatGitOrigin(hre.config.paths.root);
  const clone = await origin.checkout(ref);

  if (await clone.isInitialized()) {
    console.log(`Removing clone of ref ${clone.ref} at ${clone.directory}.`);
  }

  // remove even if uninitialized in case of failed initialization
  await clone.remove();
};

export default action;
