import { TASK_GIT_LIST } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_GIT_LIST)
  .setDescription('List checked out revisions')
  .setAction(() => import('../actions/git_list.js'))
  .build();
