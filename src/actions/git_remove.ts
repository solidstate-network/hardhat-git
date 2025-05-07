import pkg from '../../package.json';
import { Origin } from '../lib/git.js';
import { HardhatPluginError } from 'hardhat/plugins';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref: string;
  force: boolean;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const { ref, force } = args;

  const origin = new Origin(hre.config.paths.root);
  const clone = await origin.checkout(ref);

  if (!force && !(await clone.exists())) {
    throw new HardhatPluginError(
      pkg.name,
      `Clone of ref ${ref} does not exist`,
    );
  }

  await clone.remove();
};

export default action;
