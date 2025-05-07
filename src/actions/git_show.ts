import { HardhatGitOrigin } from '../lib/hardhat_git.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface TaskActionArguments {
  ref: string;
}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  const { ref } = args;

  const origin = new HardhatGitOrigin(hre.config.paths.root);
  const clone = await origin.checkout(ref);

  const status = await clone.isInitialized();

  console.log('Parsed ref:', clone.ref);
  console.log('Directory:', clone.directory);
  console.log('Initialized:', status);
};

export default action;
