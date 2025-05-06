import { Origin } from '../lib/git.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const origin = new Origin(hre.config.paths.root);
  console.log(await origin.list());
};

export default action;
