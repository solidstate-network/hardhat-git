import { Origin } from '../lib/git.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref: string;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  // TODO: print more information
  const origin = new Origin(hre.config.paths.root);
  const clone = await origin.checkout(args.ref);

  const status = await clone.isInitialized();

  console.log(clone.directory);
  console.log('initialized', status);
};

export default action;
