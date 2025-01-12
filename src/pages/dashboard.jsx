import clsx from 'clsx';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  LogoutIcon,
  PlusIcon,
  LoadingIcon,
  MenuIcon,
  ArrowBack,
} from '~/assets';
import { SwitchButton, ThreeButton } from '~/components/common';
import { Task, TaskModalForm } from '~/components/dashboardPage';
import { useAccount } from '~/contexts/AccountContext';
import { useAuth } from '~/contexts/AuthContext';
import useTasks from '~/hooks/useTasks';
import styles from '~/styles/pages/DashboardPage.module.scss';
import { localStorageKeys, removeTokenFromLocalStorage } from '~/utils/local';

const DashboardPage = () => {
  const router = useRouter();

  const { isAuthenticated, isLoading: isLoadingAuth, logoutUser } = useAuth();
  const { accountData } = useAccount();
  const {
    tasks,
    filtedTasks,
    isLoading: isLoadingTasks,
    sortTasks,
    filtTasks,
    createTask,
    editTask,
    removeTask,
  } = useTasks();

  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [sortingCriteria, setSortingCriteria] = useState('priority');
  const [sortingOrder, setSortingOrder] = useState('desc');
  const [filter, setFilter] = useState('uncompleted');

  const [tasksAreSorted, setTasksAreSorted] = useState(false);

  const [taskModalFormStatus, setTaskModalFormStatus] = useState('closed');
  const [initialTaskFormValues, setInitialTaskFormValues] = useState({
    name: '',
    priority: 'high',
    // priority: '5',
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const idOfTaskBeingEditedRef = useRef(null);

  const userFullName = useMemo(() => {
    if (!accountData) return '';
    return `${accountData.firstName} ${accountData.lastName}`;
  }, [accountData]);

  useEffect(() => {
    if (tasks.length === 0 || tasksAreSorted) return;

    sortTasks(sortingCriteria, sortingOrder);
    setTasksAreSorted(true);

    filtTasks(tasks, filter);
  }, [
    tasks,
    filter,
    filtedTasks,
    tasksAreSorted,
    sortingCriteria,
    sortingOrder,
    sortTasks,
    filtTasks,
  ]);

  const updateSortingCriteria = useCallback(
    (newSortingCriteria) => {
      if (newSortingCriteria === sortingCriteria) return;
      setSortingCriteria(newSortingCriteria);
      sortTasks(newSortingCriteria, sortingOrder);
    },
    [sortTasks, sortingCriteria, sortingOrder],
  );

  const updateSortingOrder = useCallback(
    (newSortingOrder) => {
      if (newSortingOrder === sortingOrder) return;
      setSortingOrder(newSortingOrder);
      sortTasks(sortingCriteria, newSortingOrder);
    },
    [sortTasks, sortingCriteria, sortingOrder],
  );

  // const updateFilter = useCallback(
  //   (newfilterCriteria) => {
  //     if (newfilterCriteria === filter) return;
  //     setFilter(newfilterCriteria);
  //     filtTasks(tasks. newfilterCriteria);
  //   },[],
  //   //Need TO fix
  //   // [filtTasks, filter],
  // );

  const openTaskCreationForm = useCallback(() => {
    setTaskModalFormStatus('create');
    setInitialTaskFormValues({ name: '', priority: 'High' });
  }, []);

  const openTaskEditingForm = useCallback((taskData) => {
    setTaskModalFormStatus('edit');
    idOfTaskBeingEditedRef.current = taskData.id;

    const { name, priority } = taskData;
    setInitialTaskFormValues({ name, priority });
  }, []);

  const handleTaskCreate = useCallback(
    async (taskData) => {
      setIsCreatingTask(true);

      await createTask(taskData, { sortingCriteria, sortingOrder });

      setIsCreatingTask(false);
      setTaskModalFormStatus('closed');
    },
    [createTask, sortingCriteria, sortingOrder],
  );

  const logoutAccount = async () => {
    // TODO: remove cridential from server
    // await logoutUser();

    removeTokenFromLocalStorage(localStorageKeys.REFRESH_TOKEN);
    router.push('/login');
  };

  const handleTaskEdit = useCallback(
    ({ name, priority }) => {
      setTaskModalFormStatus('closed');

      const taskId = idOfTaskBeingEditedRef.current;
      editTask(taskId, { name, priority }, { sortingCriteria, sortingOrder });
    },
    [editTask, sortingCriteria, sortingOrder],
  );

  const handleTaskRemove = useCallback(() => {
    setTaskModalFormStatus('closed');

    const taskId = idOfTaskBeingEditedRef.current;
    removeTask(taskId);
  }, [removeTask]);

  const updateTaskCheckedState = useCallback(
    ({ id: taskId, isChecked }) => {
      editTask(
        taskId,
        { isCompleted: isChecked },
        { sortingCriteria, sortingOrder },
      );
    },
    [editTask, sortingCriteria, sortingOrder],
  );

  useEffect(() => {
    console.log(
      'isLoadingAuth:',
      isLoadingAuth,
      ', isAuthenticated:',
      isAuthenticated,
    );

    const shouldRedirect = !isLoadingAuth && !isAuthenticated;

    if (shouldRedirect) {
      router.replace('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard | Tasks</title>
      </Head>

      <TaskModalForm
        status={taskModalFormStatus}
        initialValues={initialTaskFormValues}
        onCreateTask={handleTaskCreate}
        onEditTask={handleTaskEdit}
        onRemoveTask={handleTaskRemove}
        onClose={() => setTaskModalFormStatus('closed')}
        loading={isCreatingTask}
      />

      <aside className={clsx(isSidebarOpen && styles.active)}>
        <div className={styles.userInfo}>
          <div className={styles.firstLine}>
            <div className={styles.userImageContainer}>
              <div className={styles.userImage} />
            </div>
            <button
              type="button"
              className={styles.closeSidebarButton}
              onClick={() => setIsSidebarOpen(false)}
            >
              <ArrowBack />
            </button>
          </div>
          <h1>{userFullName}</h1>
        </div>
        <div className={styles.sidebarMenu}>
          {/* <button type="button" onClick={openTaskCreationForm}>
            <PlusIcon /> New Task
          </button> */}
          <button type="button" onClick={logoutAccount}>
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>

      <main>
        <div className={styles.topContents}>
          <div className={styles.titleAndDescription}>
            <div className={styles.firstLine}>
              <button
                type="button"
                className={styles.openSidebarButton}
                onClick={() => setIsSidebarOpen(true)}
              >
                <MenuIcon />
              </button>
              <h1>Tasks</h1>
              <button type="button" onClick={openTaskCreationForm}>
                <PlusIcon /> New Task
              </button>
            </div>
            <p>
              Mark your tasks as completed, add new tasks or edit the existing
              ones.
            </p>
          </div>
          <div className={styles.preferences}>
            <div className={styles.sortingCriteria}>
              <span>Filter</span>
              <ThreeButton
                leftName="all"
                leftValue="All"
                midName="Uncompleted"
                midValue="uncompleted"
                rightName="completed"
                rightValue="Completed"
                // onChange={updateFilter}
              />
            </div>

            <div className={styles.sortingCriteria}>
              <span>Order</span>
              <SwitchButton
                leftName="priority"
                leftValue="Priority"
                rightName="name"
                rightValue="Name"
                onChange={updateSortingCriteria}
              />
            </div>
            <div className={styles.sortingOrder}>
              <select
                name="sortingOrder"
                onChange={(event) => updateSortingOrder(event.target.value)}
              >
                <option value="desc">
                  {/* {sortingCriteria === 'priority' ? '9' : 'Alphabetical ↓'} */}
                  {sortingCriteria === 'priority' ? 'High' : 'Alphabetical ↓'}
                </option>
                <option value="asc">
                  {/* {sortingCriteria === 'priority' ? '0' : 'Alphabetical ↑'} */}
                  {sortingCriteria === 'priority' ? 'Low' : 'Alphabetical ↑'}
                </option>
              </select>
            </div>
          </div>
        </div>

        {!isLoadingTasks && (
          <div
            className={clsx(
              styles.taskList,
              filtedTasks.length === 0 && styles.noTasks,
            )}
          >
            {tasksAreSorted &&
              filtedTasks.map((task) => (
                <Task
                  key={task.id}
                  id={task.id}
                  name={task.name}
                  priority={task.priority}
                  checked={task.isCompleted}
                  onTaskClick={openTaskEditingForm}
                  onCheck={updateTaskCheckedState}
                />
              ))}

            {filtedTasks.length === 0 && (
              <span className={styles.noTasksMessage}>
                No tasks at the moment :)
              </span>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
