import { useCallback, useRef } from 'react';

import { TrashIcon } from '~/assets';
import { Button, Input } from '~/components/common';
import styles from '~/styles/components/dashboardPage/TaskForm.module.scss';
import * as validate from '~/utils/validation';

const TaskForm = ({
  onValidSubmit,
  submitButtonText,
  showRemoveButton = false,
  onRemoveButtonClick,
  initialValues = {},
  loading: isLoading,
}) => {
  const taskNameInputRef = useRef(null);
  const taskPrioritySelectRef = useRef(null);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const taskNameIsValid = await taskNameInputRef.current?.validate();
      if (!taskNameIsValid) return;

      const taskName = taskNameInputRef.current?.value;
      const taskPriority = taskPrioritySelectRef.current?.value;

      onValidSubmit?.({ name: taskName, priority: taskPriority });
    },
    [onValidSubmit],
  );

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.firstLineContainer}>
        <Input
          ref={taskNameInputRef}
          name="taskName"
          validate={validate.requiredTextField}
          variant="outline"
          placeholder="Nome..."
          initialValue={initialValues.name}
        />

        {showRemoveButton && (
          <button
            className={styles.removeTaskButton}
            type="button"
            onClick={onRemoveButtonClick}
            title="Remover tarefa"
          >
            <TrashIcon />
            Remove Task
          </button>
        )}
      </div>

      <div className={styles.prioritySelectContainer}>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="taskPriority">Priority</label>
        <select
          ref={taskPrioritySelectRef}
          id="taskPriority"
          name="taskPriority"
          defaultValue={initialValues.priority}
        >
          <option value="high">High</option>
          <option value="low">Low</option>
        </select>
      </div>

      <Button type="submit" loading={isLoading}>
        {submitButtonText}
      </Button>
    </form>
  );
};

export default TaskForm;
