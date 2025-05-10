import { TASK_GIT_CLONE } from '../task_names.js';
import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

export default task(TASK_GIT_CLONE)
  .setDescription(
    'Create a clone of the current git repository at a specified reference',
  )
  .addPositionalArgument({
    name: 'ref',
    description: 'Git reference to checkout',
    defaultValue: 'HEAD',
  })
  .addFlag({
    name: 'force',
    description: 'Delete existing clone and clone again',
  })
  .setAction(import.meta.resolve('../actions/git_clone.js'))
  .build();
