import { TASK_GIT } from '../task_names.js';
import { emptyTask } from 'hardhat/config';

export default emptyTask(TASK_GIT, 'Manage checked-out git revisions').build();
