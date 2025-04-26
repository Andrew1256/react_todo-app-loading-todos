import React from 'react';
import { Todo } from '../types/Todo';
import { Selected } from '../types/Selected';

interface Props {
  allTodos: Todo[];
  selected: string;
  setSelected: (selected: Selected) => void;
  clearAll: () => void;
  completedTodos: number;
}

export const Footer: React.FC<Props> = ({
  allTodos,
  selected,
  setSelected,
  clearAll,
  completedTodos,
}) => {
  return (
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
        onClick={() => clearAll()}
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={completedTodos === 0}
      >
        Clear completed
      </button>
    </footer>
  );
};
