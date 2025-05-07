import { HardhatGitOrigin } from '../lib/hardhat_git.js';
import { printClones } from '../lib/print.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const origin = new HardhatGitOrigin(hre.config.paths.root);
  const clones = await origin.list();

  await printClones(clones);
};

export default action;
