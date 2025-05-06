import { clone } from '../lib/git.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref: string;
  npmInstall: string;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const npmInstall = args.npmInstall || hre.config.git.npmInstall;
  await clone(hre.config.paths.root, args.ref, npmInstall);
};

export default action;
