import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Todo.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentTodo, setCurrentTodo] = useState({});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (isAuthenticated) {
      axios.get('http://localhost:5000/todos', {
        headers: { 'Authorization': token }
      })
        .then(response => setTodos(response.data))
        .catch(error => console.error('Error fetching todos:', error));
    }
  }, [isAuthenticated, token]);

  const handleLogin = () => {
    const validationErrors = validateInputs(username, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    axios.post('http://localhost:5000/login', { username, password })
      .then(response => {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
        setErrors({})
      })
      .catch(error => {
        setErrors({ general: 'Error logging in' })
        console.error('Error logging in:', error)
      }
      );

  };

  const handleRegister = () => {
    const validationErrors = validateInputs(username, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    axios.post('http://localhost:5000/register', { username, password })
      .then(response => {
        alert(response.data.message);
        setUsername('');
        setPassword('');
        setErrors({})
      })
      .catch(error => {
        setErrors({ general: 'Error registering' })
        console.error('Error registering:', error)
      });
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setTodos([]);
  };


  const addTodo = () => {
    if (newTodo.trim().length === 0) {
      setErrors({ todo: 'Todo text cannot be empty' });
      return;
    }

    const todo = { text: newTodo, completed: false };
    axios.post('http://localhost:5000/todos', todo, {
      headers: { 'Authorization': token }
    })
      .then(response => {
        setTodos([...todos, response.data]);
        setNewTodo('');
        setErrors({});
      })
      .catch(error => {
        setErrors({ general: 'Error adding todo' });
        console.error('Error adding todo:', error);
      });
  };

  const toggleTodo = (index) => {
    const todo = todos[index];
    const updatedTodo = { ...todo, completed: !todo.completed };
    axios.put(`http://localhost:5000/todos/${todo._id}`, updatedTodo, {
      headers: { 'Authorization': token }
    })
      .then(response => {
        const updatedTodos = [...todos];
        updatedTodos[index] = response.data;
        setTodos(updatedTodos);
      })
      .catch(error => {
        setErrors({ general: 'Error toggling todo' });
        console.error('Error toggling todo:', error);
      });
  };

  const deleteTodo = (index) => {
    const todoId = todos[index]._id;
    axios.delete(`http://localhost:5000/todos/${todoId}`, {
      headers: { 'Authorization': token }
    })
      .then(response => {
        const updatedTodos = todos.filter((_, i) => i !== index);
        setTodos(updatedTodos);
      })
      .catch(error => {
        setErrors({ general: 'Error deleting todo' });
        console.error('Error deleting todo:', error);
      });
  };


  const editTodo = (index) => {
    const todo = todos[index];
    setIsEditing(true);
    setCurrentTodo({ ...todo, index });
    setNewTodo(todo.text);
  };

  const saveTodo = () => {
    if (newTodo.trim().length === 0) {
      setErrors({ todo: 'Todo text cannot be empty' });
      return;
    }

    const updatedTodo = { ...currentTodo, text: newTodo };
    axios.put(`http://localhost:5000/todos/${currentTodo._id}`, updatedTodo, {
      headers: { 'Authorization': token }
    })
      .then(response => {
        const updatedTodos = [...todos];
        updatedTodos[currentTodo.index] = response.data;
        setTodos(updatedTodos);
        setIsEditing(false);
        setNewTodo('');
        setCurrentTodo({});
        setErrors({});
      })
      .catch(error => {
        setErrors({ general: 'Error saving todo' });
        console.error('Error saving todo:', error);
      });
  };

  const validateInputs = (username, password) => {
    const errors = {};
    if (!username || username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    return errors;
  };

  return (
    <div className="todo-list">
      {!isAuthenticated ? (
        <div className="auth">
          <h1>Todo List</h1>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
          {errors.general && <p className="error">{errors.general}</p>}
          {errors.username && <p className="error">{errors.username}</p>}
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
      ) : (
        <>
          <div className="input-group">
            <span className="logout_button">
              <button onClick={handleLogout} >Logout</button>
            </span>
            <h1>Todo List</h1>
            <div className="input-cont">
              <input
                className='item'
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task"
              />
              <button onClick={isEditing ? saveTodo : addTodo} className='itemButton'>
                {isEditing ? 'Save' : 'Add'}
              </button>
            </div>

          </div>
          <ul>
            {todos.map((todo, index) => (
              <li key={todo._id} className={todo.completed ? 'completed' : ''}>
                <div className="todo-item">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(index)}
                  />
                  <span>{todo.text}</span>
                </div>
                <div className="actions">
                  <button onClick={() => editTodo(index)}>Edit</button>
                  <button onClick={() => deleteTodo(index)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default TodoList;
