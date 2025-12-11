const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// GET все сообщения
router.get('/', chatController.getAllMessages);

// GET сообщение по ID
router.get('/:id', chatController.getMessageById);

// POST новое сообщение от пользователя
router.post('/', chatController.createMessage);

// PUT обновить сообщение
router.put('/:id', chatController.updateMessage);

// DELETE удалить сообщение
router.delete('/:id', chatController.deleteMessage);

// DELETE удалить ВСЕ сообщения (НОВЫЙ МЕТОД)
router.delete('/', chatController.deleteAllMessages);

// GET ответ бота (query параметр)
router.get('/bot/response', chatController.getBotResponse);

module.exports = router;