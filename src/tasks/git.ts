import { TASK_GIT } from '../task_names.js';
import { task } from 'hardhat/config';

// TODO: set task parameters
export default task(TASK_GIT)
  .setDescription('TODO: description')
  .setAction(import.meta.resolve('../actions/git.js'))
  .build();
