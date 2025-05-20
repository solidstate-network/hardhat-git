import { HardhatGitOrigin } from '../lib/hardhat_git.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  refs: string[];
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const { refs } = args;

  const origin = new HardhatGitOrigin(hre.config.paths.root);

  const clones = refs.length
    ? await Promise.all(refs.map((ref) => origin.checkout(ref)))
    : await origin.list();

  for (const clone of clones) {
    if (await clone.isInitialized()) {
      console.log(`Removing clone of ref ${clone.ref} at ${clone.directory}.`);
    }

    // remove even if uninitialized in case of failed initialization
    await clone.remove();
  }
};

export default action;
