const express = require('express');
const cors = require('cors');
const path = require('path');
const chatRoutes = require('./routes/chatRoutes');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);

});
