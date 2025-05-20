import { TASK_GIT_LIST } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_GIT_LIST)
  .setDescription('List checked out references')
  .setAction(import.meta.resolve('../actions/git_list.js'))
  .build();
