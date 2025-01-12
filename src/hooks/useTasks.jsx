import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '~/contexts/AuthContext';
import * as tasksServices from '~/services/tasks';

function sortTasksByPriority(tasks, ascending) {
  const sortingFactor = ascending ? 1 : -1;
  const comparedTo = {
    high: { high: 0, low: 1 * sortingFactor },
    low: { high: -1 * sortingFactor, low: 0 },
  };

  return tasks.sort(
    (task, taskToCompare) => comparedTo[task.priority][taskToCompare.priority],
  );
}

function sortTasksByName(tasks, ascending) {
  const sortingFactor = ascending ? 1 : -1;

  return tasks.sort((task, taskToCompare) => {
    const taskName = task.name.toLowerCase();
    const taskToCompareName = taskToCompare.name.toLowerCase();

    if (taskName > taskToCompareName) return 1 * sortingFactor;
    if (taskName < taskToCompareName) return -1 * sortingFactor;
    return 0;
  });
}

function useTasks() {
  const { isAuthenticated, makeAuthenticatedRequest } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [filtedTasks, setFiltedTasks] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      setIsLoading(true);
      const requestedTasks = await makeAuthenticatedRequest((accessToken) =>
        tasksServices.list(accessToken),
      );
      setTasks(requestedTasks);
      setIsLoading(false);
    })();
  }, [isAuthenticated, makeAuthenticatedRequest]);

  const sortTasks = useCallback((criteria, order) => {
    const ascending = order === 'asc';

    setTasks((currentTasks) =>
      criteria === 'priority'
        ? sortTasksByPriority(currentTasks, ascending)
        : sortTasksByName(currentTasks, ascending),
    );
  }, []);

  // const filtTasks = useCallback((tasks, criteria) => {
  //   if (criteria === "uncompleted")
  //     setFiltedTasks(
  //       tasks.filter((task) => task.isCompleted === false),
  //     )
  //   else if (criteria === "completed") {
  //     setFiltedTasks([{ "id": 2, "name": "test321", "des": "test des", "sub": "{1,2,3}", "owner": 1, "bytetaskId": 0, "priority": "low", "isCompleted": 1, "createdAt": "2021-09-21T03:32:23.000Z", "updatedAt": null, "completeAt": null }, { "id": 1, "name": "test321", "des": "test des", "sub": "{1,2,3}", "owner": 1, "bytetaskId": 0, "priority": "low", "isCompleted": 1, "createdAt": "2021-09-21T03:32:23.000Z", "updatedAt": null, "completeAt": null }])
  //   }
  //   else {
  //     setFiltedTasks([{ "id": 1, "name": "test321", "des": "test des", "sub": "{1,2,3}", "owner": 1, "bytetaskId": 0, "priority": "low", "isCompleted": 1, "createdAt": "2021-09-21T03:32:23.000Z", "updatedAt": null, "completeAt": null },]
  //     )
  //   }

  // }, []);

  const insertSortedTask = useCallback((newTask, criteria, order) => {
    const ascending = order === 'asc';

    setTasks((currentTasks) => {
      const updatedTasks = [...currentTasks, newTask];

      return criteria === 'priority'
        ? sortTasksByPriority(updatedTasks, ascending)
        : sortTasksByName(updatedTasks, ascending);
    });
  }, []);

  const editSortedTask = useCallback((taskId, newTaskData, criteria, order) => {
    const ascending = order === 'asc';

    setTasks((currentTasks) => {
      const updatedTasks = currentTasks.map((task) => {
        const isTaskBeingEdited = task.id === taskId;
        if (!isTaskBeingEdited) return task;

        return { ...task, ...newTaskData };
      });

      return criteria === 'priority'
        ? sortTasksByPriority(updatedTasks, ascending)
        : sortTasksByName(updatedTasks, ascending);
    });
  }, []);

  const createTask = useCallback(
    async ({ name, priority }, { sortingCriteria, sortingOrder }) => {
      if (!isAuthenticated) return;

      const createdTask = await makeAuthenticatedRequest((accessToken) =>
        tasksServices.create(accessToken, { name, priority }),
      );
      insertSortedTask(createdTask, sortingCriteria, sortingOrder);
    },
    [isAuthenticated, makeAuthenticatedRequest, insertSortedTask],
  );

  const editTask = useCallback(
    (taskId, newTaskData, { sortingCriteria, sortingOrder }) => {
      if (!isAuthenticated) return;

      makeAuthenticatedRequest((accessToken) =>
        tasksServices.edit(accessToken, taskId, newTaskData),
      );

      editSortedTask(taskId, newTaskData, sortingCriteria, sortingOrder);
    },
    [editSortedTask, isAuthenticated, makeAuthenticatedRequest],
  );

  const removeTask = useCallback(
    (taskId) => {
      if (!isAuthenticated) return;

      makeAuthenticatedRequest((accessToken) =>
        tasksServices.remove(accessToken, taskId),
      );

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );
    },
    [isAuthenticated, makeAuthenticatedRequest],
  );

  return {
    tasks,
    filtedTasks,
    isLoading,
    sortTasks,
    // filtTasks,
    createTask,
    editTask,
    removeTask,
  };
}

export default useTasks;
