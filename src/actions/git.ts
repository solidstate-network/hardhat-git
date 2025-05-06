import type { NewTaskActionFunction } from 'hardhat/types/tasks';

// TODO: define task action arguments to match parameters set in task builder
interface TaskActionArguments {}

const action: NewTaskActionFunction<TaskActionArguments> = async (
  args,
  hre,
) => {
  // TODO: define task action
};

export default action;
