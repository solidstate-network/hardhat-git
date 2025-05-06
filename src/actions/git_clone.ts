import { clone } from '../lib/git.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref: string;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  await clone(hre.config.paths.root, args.ref, hre.config.git.npmInstall);
};

export default action;
