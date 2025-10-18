## 📁 Архитектура проекта
```
todo_list_fullstack/
├── client/                # React фронтенд
│ ├── src/
│ │ ├── App.jsx            # Главный компонент приложения
│ │ ├── main.jsx           # Точка входа React
│ │ └── index.css          # Глобальные стили Tailwind
│ ├── package.json
│ ├── vite.config.js       # Конфигурация Vite
│ └── index.html
├── server/                # Express бэкенд
│ ├── index.js             # Основной серверный файл
│ ├── docker-compose.yml   # Конфигурация MongoDB
│ ├── package.json
│ └── .env                 # Переменные среды
└── README.md
```
---
## 🧩 Инструкция по запуску
1. Клонируйте репозиторий: `https://github.com/novachrono33/todo_list_fullstack.git`.
2. Создайте файл `.env` в директории `server` и наполните его следующим содержимым:
```
MONGODB_URI=mongodb://localhost:27017/todolist
PORT=5000
```
3. Убедитесь, что Docker Desktop запущен (Windows) и выполните команду: `docker-compose up -d`.
4. Скачайте пакеты и запустите сервер (в отдельном терминале):
```
cd server
npm install
npm run dev
```
5. Скачайте пакеты и запустите клиент (в отдельном терминале):
```
cd client
npm install
npm run dev
```
6. Откройте приложение в браузере по адресу http://localhost:3000
---
## 🖥️ Скриншоты
Форма добавления задачи, активные задачи
<img width="1909" height="939" alt="image" src="https://github.com/user-attachments/assets/cb82eea5-3ba6-4ee5-bd40-3e5be6c4ce1e" />

Модальное окно редактирования задачи
<img width="1906" height="936" alt="image" src="https://github.com/user-attachments/assets/86707cc2-6caf-459f-a8ff-fb7bcfd41d38" />

Подтверждение удаления задачи
<img width="1913" height="945" alt="image" src="https://github.com/user-attachments/assets/33d7e6aa-c0e9-4949-b05d-9a0ebd37986b" />

Завершенные задачи
<img width="1911" height="945" alt="image" src="https://github.com/user-attachments/assets/a2abb9af-362e-4b5f-a81b-f3edaedfd01b" />






