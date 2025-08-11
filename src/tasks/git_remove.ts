import { TASK_GIT_REMOVE } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_GIT_REMOVE)
  .setDescription(
    'Delete clones of the current git repository corresponding to a given revision',
  )
  .addVariadicArgument({
    name: 'revs',
    description:
      'List of git revisions whose clones to delete (defaults to all clones)',
    defaultValue: [],
  })
  .setAction(() => import('../actions/git_remove.js'))
  .build();
