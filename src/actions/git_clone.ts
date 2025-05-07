import pkg from '../../package.json';
import { Origin } from '../lib/git.js';
import { HardhatPluginError } from 'hardhat/plugins';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref: string;
  npmInstall: string;
  force: boolean;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const { ref, force } = args;
  const npmInstall = args.npmInstall || hre.config.git.npmInstall;

  const origin = new Origin(hre.config.paths.root);
  const clone = await origin.checkout(ref);

  if (!force && (await clone.isInitialized())) {
    throw new HardhatPluginError(
      pkg.name,
      `Clone of ref ${ref} already initialized at ${clone.directory}.`,
    );
  }

  await clone.initialize(npmInstall);
};

export default action;
