const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '../data/messages.json');

const loadMessages = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const saveMessages = async (messages) => {
    await fs.writeFile(dataPath, JSON.stringify(messages, null, 2));
};

// Функция для получения следующего ID
const getNextId = (messages) => {
    if (messages.length === 0) return 1;
    const maxId = Math.max(...messages.map(m => m.id));
    return maxId + 1;
};

const generateBotResponse = (userMessage, userName) => {
    const message = userMessage.toLowerCase();
    
    // Простые ответы
    if (message.includes('привет')) {
        return `Привет, ${userName}!`;
    }
    
    if (message.includes('как дела')) {
        return `У меня хорошо, ${userName}! А у тебя?`;
    }
    
    if (message.includes('хорошо') || message.includes('отлично')) {
        return `Рад это слышать, ${userName}!`;
    }
    
    if (message.includes('нормально')) {
        return `Неплохо, ${userName}!`;
    }
    
    if (message.includes('плохо')) {
        return `Жаль, ${userName}. Надеюсь, всё наладится.`;
    }
    
    if (message.includes('пока')) {
        return `Пока, ${userName}!`;
    }
    
    if (message.includes('имя')) {
        return `Я чат-бот на Express.`;
    }
    
    if (message.includes('время')) {
        return `Сейчас ${new Date().toLocaleTimeString('ru-RU')}`;
    }
    
    if (message.includes('дата')) {
        return `Сегодня ${new Date().toLocaleDateString('ru-RU')}`;
    }
    
    if (message.includes('express')) {
        return `Express - это фреймворк для Node.js.`;
    }
    
    if (message.includes('react')) {
        return `React - это библиотека для интерфейсов.`;
    }
    
    if (message.includes('node')) {
        return `Node.js - это среда для JavaScript.`;
    }
    
    if (message.includes('спасибо')) {
        return `Пожалуйста, ${userName}!`;
    }
    
    if (message.includes('что делаешь')) {
        return `Общаюсь с тобой, ${userName}!`;
    }
    
    if (message.includes('что ты умеешь')) {
        return `Могу ответить на простые вопросы и поддерживать разговор.`;
    }
    
    if (message.includes('расскажи о себе')) {
        return `Я простой чат-бот на Express. У меня есть API и храню сообщения в файле.`;
    }
    
    if (message.includes('api') || message.includes('апи')) {
        return `Мой API: /api/chat. Можно делать GET, POST, PUT, DELETE запросы.`;
    }
    
    if (message.includes('помощь')) {
        return `Спроси: привет, как дела, время, дата, что такое express.`;
    }
    
    // Простые ответы для всего остального
    const simpleAnswers = [
        `Не понял, ${userName}.`,
        `Попробуй спросить по-другому.`,
        `Спроси что-нибудь простое.`,
        `Я простой бот, не знаю ответа.`,
        `Можем поговорить о чём-нибудь другом?`
    ];
    
    return simpleAnswers[Math.floor(Math.random() * simpleAnswers.length)];
};

const chatController = {
    getAllMessages: async (req, res) => {
        try {
            const messages = await loadMessages();
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    getMessageById: async (req, res) => {
        try {
            const messages = await loadMessages();
            const message = messages.find(m => m.id === parseInt(req.params.id));
            
            if (!message) {
                return res.status(404).json({ error: 'Сообщение не найдено' });
            }
            
            res.json(message);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    createMessage: async (req, res) => {
        try {
            const { text, user = 'Гость' } = req.body;
            
            if (!text || text.trim() === '') {
                return res.status(400).json({ error: 'Текст сообщения обязателен' });
            }
            
            const messages = await loadMessages();
            
            // Сообщение пользователя
            const userMessage = {
                id: getNextId(messages),
                text: text.trim(),
                user,
                isBot: false,
                timestamp: new Date().toISOString()
            };
            
            messages.push(userMessage);
            await saveMessages(messages);
            
            // Отправляем ответ сразу
            res.status(201).json(userMessage);
            
            // Ответ бота через секунду
            setTimeout(async () => {
                const updatedMessages = await loadMessages(); // Загружаем заново
                const botResponse = generateBotResponse(text, user);
                const botMessage = {
                    id: getNextId(updatedMessages),
                    text: botResponse,
                    user: 'bot',
                    isBot: true,
                    timestamp: new Date().toISOString()
                };
                
                updatedMessages.push(botMessage);
                await saveMessages(updatedMessages);
                
                console.log(`Бот ответил ${user}:`, botResponse);
            }, 1000);
            
        } catch (error) {
            console.error('Ошибка создания сообщения:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    updateMessage: async (req, res) => {
        try {
            const { id } = req.params;
            const { text } = req.body;
            
            if (!text || text.trim() === '') {
                return res.status(400).json({ error: 'Текст сообщения обязателен' });
            }
            
            let messages = await loadMessages();
            const messageIndex = messages.findIndex(m => m.id === parseInt(id));
            
            if (messageIndex === -1) {
                return res.status(404).json({ error: 'Сообщение не найдено' });
            }
            
            messages[messageIndex] = {
                ...messages[messageIndex],
                text: text.trim(),
                updatedAt: new Date().toISOString()
            };
            
            await saveMessages(messages);
            res.json(messages[messageIndex]);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    deleteMessage: async (req, res) => {
        try {
            const { id } = req.params;
            let messages = await loadMessages();
            
            const filteredMessages = messages.filter(m => m.id !== parseInt(id));
            
            if (filteredMessages.length === messages.length) {
                return res.status(404).json({ error: 'Сообщение не найдено' });
            }
            
            await saveMessages(filteredMessages);
            res.json({ message: 'Сообщение удалено' });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // ДОБАВИМ МЕТОД ДЛЯ УДАЛЕНИЯ ВСЕХ СООБЩЕНИЙ
    deleteAllMessages: async (req, res) => {
        try {
            // Просто сохраняем пустой массив
            await saveMessages([]);
            res.json({ message: 'Все сообщения удалены' });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    getBotResponse: async (req, res) => {
        try {
            const { message, userName = 'Гость' } = req.query;
            
            if (!message || message.trim() === '') {
                return res.status(400).json({ error: 'Параметр message обязателен' });
            }
            
            const response = generateBotResponse(message, userName);
            res.json({ 
                originalMessage: message,
                userName: userName,
                response: response 
            });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
};

module.exports = chatController;