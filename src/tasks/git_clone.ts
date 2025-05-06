import { TASK_GIT_CLONE } from '../task_names.js';
import { task } from 'hardhat/config';

export default task(TASK_GIT_CLONE)
  .setDescription(
    'Create a clone of the current git repository at a specified reference',
  )
  .addPositionalArgument({
    name: 'ref',
    description: 'Git reference to checkout',
    defaultValue: 'HEAD',
  })
  .addOption({
    name: 'npmInstall',
    description: 'Command to use for NPM dependency installation',
    // TODO: undefined default value
    defaultValue: '',
  })
  .setAction(import.meta.resolve('../actions/git_clone.js'))
  .build();
