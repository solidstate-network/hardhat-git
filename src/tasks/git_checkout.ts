import { TASK_GIT_CHECKOUT } from '../task_names.js';
import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

export default task(TASK_GIT_CHECKOUT)
  .setDescription(
    'Create a temporary clone of the current git repository at a specified revision',
  )
  .addPositionalArgument({
    name: 'rev',
    description: 'Git revision to checkout',
    defaultValue: 'HEAD',
  })
  .addOption({
    name: 'npmInstall',
    description: 'Command to use for NPM dependency installation',
    defaultValue: undefined,
    type: ArgumentType.STRING_WITHOUT_DEFAULT,
  })
  .addFlag({
    name: 'force',
    description: 'Delete existing clone and clone again',
  })
  .setAction(() => import('../actions/git_checkout.js'))
  .build();
