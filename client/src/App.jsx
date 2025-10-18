import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Базовый URL API бэкенда
const API_BASE = 'http://localhost:5000';

/**
 * Главный компонент приложения Todo List
 * Реализует управление задачами с возможностью создания, редактирования, 
 * удаления и отметки выполнения
 */
function App() {
  // Состояния компонента
  const [tasks, setTasks] = useState([]); // Список всех задач
  const [title, setTitle] = useState(''); // Поле ввода заголовка
  const [description, setDescription] = useState(''); // Поле ввода описания
  const [editingTask, setEditingTask] = useState(null); // Редактируемая задача
  const [deleteConfirm, setDeleteConfirm] = useState(null); // ID задачи для подтверждения удаления
  const [activeTab, setActiveTab] = useState('active'); // Активная вкладка: 'active' | 'completed'
  
  // Референсы для управления фокусом полей ввода
  const descriptionRef = useRef(null);
  const titleRef = useRef(null);

  /**
   * Загрузка списка задач с сервера
   * Вызывается при монтировании компонента и после мутаций данных
   */
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  /**
   * Создание новой задачи
   * Валидирует входные данные и отправляет POST-запрос на сервер
   */
  const handleCreateTask = async () => {
    if (!title.trim() || !description.trim()) return;

    try {
      await axios.post(`${API_BASE}/tasks`, {
        title: title.trim(),
        description: description.trim()
      });
      setTitle('');
      setDescription('');
      fetchTasks();
      // Возвращаем фокус в поле заголовка для быстрого ввода следующей задачи
      if (titleRef.current) {
        titleRef.current.focus();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  /**
   * Переключение статуса выполнения задачи
   * @param {string} taskId - ID задачи для переключения статуса
   */
  const toggleTaskStatus = async (taskId) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/toggle`);
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  };

  /**
   * Обновление существующей задачи
   * @param {Event} e - Событие формы
   */
  const updateTask = async (e) => {
    e.preventDefault();
    if (!editingTask.title.trim() || !editingTask.description.trim()) return;

    try {
      await axios.put(`${API_BASE}/tasks/${editingTask._id}`, {
        title: editingTask.title.trim(),
        description: editingTask.description.trim()
      });
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  /**
   * Удаление задачи с подтверждением
   * @param {string} id - ID задачи для удаления
   */
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${id}`);
      setDeleteConfirm(null);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  /**
   * Обработчик нажатия клавиш в поле заголовка
   * Enter - переход к полю описания
   */
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (descriptionRef.current) {
        descriptionRef.current.focus();
      }
    }
  };

  /**
   * Обработчик нажатия клавиш в поле описания
   * Enter - создание задачи (без Shift)
   * Shift+Enter - перенос строки
   */
  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask();
    }
  };

  /**
   * Обработчик отправки формы
   * @param {Event} e - Событие формы
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleCreateTask();
  };

  // Загрузка задач при монтировании компонента
  useEffect(() => {
    fetchTasks();
    // Устанавливаем фокус на поле заголовка для удобства пользователя
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  // Фильтрация задач по статусу выполнения
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const displayedTasks = activeTab === 'active' ? activeTasks : completedTasks;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Форма создания новой задачи */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Task title"
                required
              />
            </div>
            <div className="flex-1">
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleDescriptionKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[42px]"
                placeholder="Task description"
                rows="1"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition duration-200 whitespace-nowrap"
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Навигация между активными и выполненными задачами */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition duration-200 ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Tasks ({activeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition duration-200 ${
              activeTab === 'completed'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed Tasks ({completedTasks.length})
          </button>
        </div>

        {/* Сетка карточек задач */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayedTasks.map((task) => (
            <div
              key={task._id}
              className={`bg-white rounded-lg border p-4 hover:shadow-md transition duration-200 group relative h-48 flex flex-col ${
                task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}
            >
              {/* Заголовок задачи с чекбоксом выполнения */}
              <div className="flex items-start gap-3 mb-2">
                <button
                  onClick={() => toggleTaskStatus(task._id)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-1 transition duration-200 ${
                    task.completed
                      ? 'bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <h3 className={`font-semibold text-lg flex-1 line-clamp-1 ${
                  task.completed ? 'text-green-800 line-through' : 'text-gray-800'
                }`}>
                  {task.title}
                </h3>
              </div>

              {/* Описание задачи с ограничением по высоте */}
              <div className="flex-1 mb-3 overflow-hidden">
                <p className={`text-sm whitespace-pre-wrap line-clamp-3 ${
                  task.completed ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {task.description}
                </p>
              </div>
              
              {/* Футер карточки с датой и кнопками действий */}
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xs text-gray-500">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
                
                {/* Кнопки действий (появляются при наведении) */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {deleteConfirm === task._id ? (
                    // Режим подтверждения удаления
                    <>
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition duration-200"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="bg-gray-500 text-white py-1 px-3 rounded text-sm hover:bg-gray-600 transition duration-200"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    // Стандартные кнопки действий
                    <>
                      <button
                        onClick={() => setEditingTask(task)}
                        className="bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600 transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(task._id)}
                        className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600 transition duration-200"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Сообщение при отсутствии задач */}
        {displayedTasks.length === 0 && (
          <div className="text-center text-gray-500 mt-8 py-12 border-2 border-dashed border-gray-300 rounded-lg">
            {activeTab === 'active' 
              ? 'No active tasks. Add your first task above!'
              : 'No completed tasks yet.'
            }
          </div>
        )}
      </div>

      {/* Модальное окно редактирования задачи */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <form onSubmit={updateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;