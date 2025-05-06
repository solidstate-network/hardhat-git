import { Origin } from '../lib/git.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref: string;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const origin = new Origin(hre.config.paths.root);
  const clone = await origin.checkout(args.ref);
  await clone.remove();
};

export default action;
