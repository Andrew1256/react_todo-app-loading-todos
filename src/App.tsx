import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  deleteTodos,
  getTodos,
  patchTodos,
  postTodos,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';

type Selected = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [errors, setErrors] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingText, setUpdatingText] = useState('');
  const [loadingTodo, setLoadingTodo] = useState(true);
  const [editTodo, setEditTodo] = useState('');
  const [selected, setSelected] = useState<Selected>('all');

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const todos = await getTodos();

        setErrors('');
        setAllTodos(todos);
      } catch {
        setErrors('Unable to load todos');
      } finally {
        setLoadingTodo(false);
      }
    };

    loadTodos();
  }, []);

  useEffect(() => {
    if (!errors) {
      return;
    }

    const timeout = setTimeout(() => {
      setErrors('');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [errors]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const filteredTodos = allTodos.filter(todo => {
    if (selected === 'active') {
      return !todo.completed;
    }

    if (selected === 'completed') {
      return todo.completed;
    }

    return true;
  });

  const completedTodos = allTodos.filter(todo => todo.completed).length;

  const handleEdit = (id: number, title: string) => {
    setUpdatingId(id);
    setUpdatingText(title);
  };

  const handleAdd = async () => {
    if (!editTodo.trim()) {
      return;
    }

    try {
      const newTodo = await postTodos({
        title: editTodo.trim(),
        completed: false,
      });

      setAllTodos(current => [...current, newTodo]);
      setEditTodo('');
    } catch {
      setErrors('Unable to add todo');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodos(id);
      setAllTodos(current => current.filter(todo => todo.id !== id));
    } catch {
      setErrors('Unable to delete todo');
    }
  };

  const handleSave = async (id: number) => {
    if (!updatingText.trim()) {
      return;
    }

    try {
      const updatedTodo = await patchTodos(id, { title: updatingText.trim() });

      setAllTodos(current => current.map(t => (t.id === id ? updatedTodo : t)));
    } catch {
      setErrors('Unable to update todo');
    } finally {
      setUpdatingId(null);
      setUpdatingText('');
    }
  };

  const toggleCompleted = async (id: number, currentStatus: boolean) => {
    try {
      const updatedTodo = await patchTodos(id, { completed: !currentStatus });

      setAllTodos(current => current.map(t => (t.id === id ? updatedTodo : t)));
    } catch {
      setErrors('Unable to update todo');
    }
  };

  const clearAllCompleted = async () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const completedTodos = allTodos.filter(todo => todo.completed);

    try {
      await Promise.all(completedTodos.map(todo => deleteTodos(todo.id)));

      setAllTodos(current => current.filter(todo => !todo.completed));
    } catch {
      setErrors('Unable to delete completed todos');
    }
  };

  const updateAllToCompleted = async () => {
    const shouldCompleteAll = !allTodos.every(todo => todo.completed);

    try {
      const updatedTodos = await Promise.all(
        allTodos.map(todo =>
          patchTodos(todo.id, { completed: shouldCompleteAll }),
        ),
      );

      setAllTodos(updatedTodos);
    } catch {
      setErrors('Unable to update all todos');
    }
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {allTodos.length !== 0 && (
            <button
              onClick={() => updateAllToCompleted()}
              type="button"
              className={`todoapp__toggle-all ${allTodos.every(todo => todo.completed) ? 'active' : ''}`}
              data-cy="ToggleAllButton"
            />
          )}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <input
              value={editTodo}
              onChange={e => setEditTodo(e.target.value)}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {!loadingTodo &&
            filteredTodos.map(todo => (
              <div
                key={todo.id}
                data-cy="Todo"
                className={`todo ${todo.completed ? 'completed' : ''}`}
              >
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label
                  className="todo__status-label"
                  onClick={() => toggleCompleted(todo.id, todo.completed)}
                >
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                    readOnly
                  />
                </label>

                {updatingId === todo.id ? (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSave(todo.id);
                    }}
                  >
                    <input
                      type="text"
                      value={updatingText}
                      onChange={e => setUpdatingText(e.target.value)}
                      onBlur={() => handleSave(todo.id)}
                      autoFocus
                      className="todo__title-field"
                      data-cy="TodoTitleField"
                    />
                  </form>
                ) : (
                  <>
                    <span
                      data-cy="TodoTitle"
                      className="todo__title"
                      onDoubleClick={() => handleEdit(todo.id, todo.title)}
                    >
                      {todo.title}
                    </span>

                    <button
                      type="button"
                      className="todo__remove"
                      data-cy="TodoDelete"
                      onClick={() => handleDelete(todo.id)}
                    >
                      ×
                    </button>
                  </>
                )}

                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            ))}
        </section>

        {allTodos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {allTodos.filter(todo => !todo.completed).length} items left
            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${selected === 'all' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={() => setSelected('all')}
              >
                All
              </a>
              <a
                href="#/active"
                className={`filter__link ${selected === 'active' ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={() => setSelected('active')}
              >
                Active
              </a>
              <a
                href="#/completed"
                className={`filter__link ${selected === 'completed' ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={() => setSelected('completed')}
              >
                Completed
              </a>
            </nav>

            <button
              onClick={() => clearAllCompleted()}
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={completedTodos === 0}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${errors ? '' : 'hidden'}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrors('')}
        ></button>
        {errors}
      </div>
    </div>
  );
};
