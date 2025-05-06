import { deriveTemporaryDirectory, exists } from '../lib/git.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref: string;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  // TODO: print more information
  const directory = await deriveTemporaryDirectory(
    hre.config.paths.root,
    args.ref,
  );
  const status = await exists(hre.config.paths.root, args.ref);
  console.log(directory);
  console.log('exists', status);
};

export default action;
