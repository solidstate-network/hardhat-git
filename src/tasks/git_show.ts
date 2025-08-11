import { TASK_GIT_SHOW } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_GIT_SHOW)
  .setDescription(
    'Print information about a clone of the current git repository at a given revision',
  )
  .addPositionalArgument({
    name: 'rev',
    description: 'Git revision whose clone print information about',
    defaultValue: 'HEAD',
  })
  .setAction(() => import('../actions/git_show.js'))
  .build();
