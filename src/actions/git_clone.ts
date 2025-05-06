import pkg from '../../package.json';
import { clone, deriveDirectory, exists } from '../lib/git.js';
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
  const origin = hre.config.paths.root;
  const { ref } = args;
  const npmInstall = args.npmInstall || hre.config.git.npmInstall;

  if (!args.force && (await exists(origin, ref))) {
    if (await exists(origin, ref)) {
      const directory = await deriveDirectory(origin, ref);

      throw new HardhatPluginError(
        pkg.name,
        `Clone of ref ${ref} already exists at ${directory}.`,
      );
    }
  }

  await clone(origin, ref, npmInstall);
};

export default action;
