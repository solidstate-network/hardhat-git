import { HardhatGitOrigin } from '../lib/hardhat_git.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  revs: string[];
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const { revs } = args;

  const origin = new HardhatGitOrigin(hre.config.paths.root);

  const clones = revs.length
    ? await Promise.all(revs.map((rev) => origin.checkout(rev)))
    : await origin.list();

  for (const clone of clones) {
    if (await clone.isInitialized()) {
      console.log(`Removing clone of rev ${clone.rev} at ${clone.directory}.`);
    }

    // remove even if uninitialized in case of failed initialization
    await clone.remove();
  }
};

export default action;
