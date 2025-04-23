import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

const userFromStorage = localStorage.getItem('user');

export const USER_ID = userFromStorage ? JSON.parse(userFromStorage).id : 0;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const patchTodos = (id: number, data: Partial<Todo>) => {
  return client.patch<Todo>(`/todos/${id}`, data);
};

export const postTodos = (data: Partial<Todo>) => {
  return client.post<Todo>(`/todos`, { ...data, userId: USER_ID });
};

export const deleteTodos = (id: number) => {
  return client.delete(`/todos/${id}`);
};

// Add more methods here
/*
import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

// Отримати userId з локального сховища
const getUserId = (): number => {
  const user = localStorage.getItem('user');

  try {
    return user ? JSON.parse(user).id || 0 : 0;
  } catch {
    return 0;
  }
};

// Отримати список задач
export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${getUserId()}`);
};

// Додати нову задачу
export const addTodo = (title: string) => {
  return client.post<Todo>('/todos', {
    userId: getUserId(),
    title,
    completed: false,
  });
};

// Видалити задачу за ID
export const deleteTodo = (todoId: number) => {
  return client.delete(`/todos/${todoId}`);
};

// Оновити задачу за ID
export const updateTodo = (todoId: number, updatedData: Partial<Todo>) => {
  return client.patch<Todo>(`/todos/${todoId}`, updatedData);
};

// Змінити статус усіх задач
export const toggleAllTodos = (todos: Todo[], completed: boolean) => {
  return Promise.all(
    todos.map(todo => {
      if (todo.completed !== completed) {
        return updateTodo(todo.id, { completed });
      }
      return Promise.resolve(todo);
    })
  );
};

// Очистити всі завершені задачі
export const clearCompletedTodos = (todos: Todo[]) => {
  const completed = todos.filter(todo => todo.completed);

  return Promise.all(completed.map(todo => deleteTodo(todo.id)));
};
*/
