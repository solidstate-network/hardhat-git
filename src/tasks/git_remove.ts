import { TASK_GIT_REMOVE } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_GIT_REMOVE)
  .setDescription(
    'Delete a clone of the current git repository corresponding to a given reference',
  )
  .addVariadicArgument({
    name: 'refs',
    description:
      'List of git references whose clones to delete (removes all clones by default)',
    defaultValue: [],
  })
  .setAction(import.meta.resolve('../actions/git_remove.js'))
  .build();
