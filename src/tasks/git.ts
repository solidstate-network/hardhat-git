import { TASK_GIT } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_GIT)
  .setDescription('Print information about all existing clones')
  .setAction(import.meta.resolve('../actions/git.js'))
  .build();
