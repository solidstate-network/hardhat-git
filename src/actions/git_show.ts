import { HardhatGitOrigin } from '../lib/hardhat_git.js';
import { printClone } from '../lib/print.js';
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

  await printClone(clone);
};

export default action;
