import { TASK_NAME } from '../task_names.js';
import { task } from 'hardhat/config';

// TODO: set task parameters
export default task(TASK_NAME)
  .setDescription('TODO: description')
  .setAction(import.meta.resolve('../actions/task.js'))
  .build();
