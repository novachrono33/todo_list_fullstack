import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Инициализация environment variables
dotenv.config();

/**
 * Express приложение для API Todo List
 * Предоставляет RESTful endpoints для управления задачами
 */
const app = express();

// Middleware для обработки CORS и JSON
app.use(cors());
app.use(express.json());

/**
 * Подключение к MongoDB
 * Использует URI из environment variables или значение по умолчанию
 */
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todolist')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

/**
 * Схема задачи в MongoDB
 * Определяет структуру и валидацию данных задачи
 */
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Автоматически добавляет createdAt и updatedAt
});

// Модель задачи для работы с коллекцией в MongoDB
const Task = mongoose.model('Task', taskSchema);

// ==================== API ENDPOINTS ====================

/**
 * GET /tasks
 * Возвращает список всех задач, отсортированных по дате создания (новые первыми)
 */
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('GET /tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /tasks
 * Создает новую задачу
 * Требует поля title и description в теле запроса
 */
app.post('/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Валидация обязательных полей
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const task = new Task({ title, description });
    await task.save();
    
    console.log(`POST /tasks - Created: ${title}`);
    res.status(201).json(task);
  } catch (error) {
    console.error('POST /tasks error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /tasks/:id
 * Обновляет существующую задачу
 * @param {string} id - ID задачи для обновления
 */
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    // Валидация формата ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await Task.findByIdAndUpdate(
      id, 
      { title, description },
      { new: true } // Возвращает обновленный документ
    );
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log(`PUT /tasks/${id} - Updated: ${title}`);
    res.json(task);
  } catch (error) {
    console.error(`PUT /tasks/${id} error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /tasks/:id
 * Удаляет задачу по ID
 * @param {string} id - ID задачи для удаления
 */
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await Task.findByIdAndDelete(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log(`DELETE /tasks/${id} - Deleted: ${task.title}`);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(`DELETE /tasks/${id} error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /tasks/:id/toggle
 * Переключает статус выполнения задачи (completed/active)
 * @param {string} id - ID задачи для переключения статуса
 */
app.patch('/tasks/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Инвертирование статуса выполнения
    task.completed = !task.completed;
    await task.save();

    console.log(`PATCH /tasks/${id}/toggle - ${task.completed ? 'Completed' : 'Active'}: "${task.title}"`);
    res.json(task);
  } catch (error) {
    console.error(`PATCH /tasks/${id}/toggle error:`, error.message);
    res.status(500).json({ error: 'Failed to toggle task status' });
  }
});

/**
 * Запуск сервера на указанном порту
 * Порт берется из environment variables или используется 5000 по умолчанию
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});