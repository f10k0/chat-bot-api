const API_URL = '/api/chat';
let currentUserName = localStorage.getItem('chatUserName') || '';

// При загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (currentUserName) {
        showChatInterface();
    } else {
        showNameInput();
    }
    loadMessages();
});

// Показать поле ввода имени
function showNameInput() {
    document.getElementById('nameInputContainer').style.display = 'block';
    document.getElementById('chatMain').style.display = 'none';
}

// Показать интерфейс чата
function showChatInterface() {
    document.getElementById('nameInputContainer').style.display = 'none';
    document.getElementById('chatMain').style.display = 'flex';
    document.getElementById('currentUserName').textContent = currentUserName;
    document.getElementById('messageInput').focus();
}

// Установить имя пользователя
function setUserName() {
    const nameInput = document.getElementById('userNameInput');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Пожалуйста, введите имя');
        return;
    }
    
    currentUserName = name;
    localStorage.setItem('chatUserName', name);
    showChatInterface();
    
    // Добавляем информационное сообщение от бота
    addMessageToChat(
        `Привет, ${name}! Я Express-бот. Я могу ответить на многие вопросы! Попробуйте спросить:`,
        true,
        'Бот'
    );
    
    // Добавляем примеры вопросов
    setTimeout(() => {
        addMessageToChat(
            "• Как дела?\n• Что такое Express?\n• Который час?\n• Что ты умеешь?\n• Расскажи о себе",
            true,
            'Бот'
        );
    }, 500);
}

// Сменить имя
function changeUserName() {
    if (confirm('Сменить имя? Текущая история сообщений сохранится.')) {
        currentUserName = '';
        localStorage.removeItem('chatUserName');
        showNameInput();
        document.getElementById('userNameInput').value = '';
        document.getElementById('userNameInput').focus();
    }
}

// Показать информацию об API
function showApiInfo() {
    document.getElementById('apiModal').style.display = 'flex';
}

// Скрыть информацию об API
function hideApiInfo() {
    document.getElementById('apiModal').style.display = 'none';
}

// Загрузить все сообщения
async function loadMessages() {
    try {
        const response = await fetch(API_URL);
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
        addSystemMessage('Ошибка загрузки сообщений');
    }
}

// Отправить сообщение
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Показываем сообщение пользователя сразу
    addMessageToChat(text, false, currentUserName);
    input.value = '';
    input.focus();
    
    try {
        // Отправляем на сервер с именем пользователя
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                text: text,
                user: currentUserName
            })
        });
        
        await response.json();
        
        // Через секунду запрашиваем обновленные сообщения (чтобы получить ответ бота)
        setTimeout(loadMessages, 1500);
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        addSystemMessage('Ошибка отправки сообщения');
    }
}

// Отобразить сообщения в чате
function displayMessages(messages) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';
    
    if (messages.length === 0) {
        addSystemMessage('История сообщений пуста');
        return;
    }
    
    messages.forEach(msg => {
        const senderName = msg.isBot ? '🤖 Бот' : `👤 ${msg.user || 'Гость'}`;
        addMessageToChat(msg.text, msg.isBot, senderName, msg.timestamp);
    });
    
    // Автоматическая прокрутка вниз
    scrollToBottom();
}

// Добавить одно сообщение в чат
function addMessageToChat(text, isBot, sender, timestamp = null) {
    const container = document.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    
    const time = timestamp 
        ? new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
    messageDiv.innerHTML = `
        <div class="message-sender">${sender}</div>
        <div class="message-text">${text}</div>
        <div class="message-time">${time}</div>
    `;
    
    container.appendChild(messageDiv);
}

// Прокрутить вниз
function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

// Добавить системное сообщение
function addSystemMessage(text) {
    const container = document.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = 'system-message';
    messageDiv.innerHTML = `
        <div class="message-sender">⚙️ Система</div>
        <div class="message-text">${text}</div>
    `;
    
    container.appendChild(messageDiv);
    scrollToBottom();
}

// Очистить весь чат
async function clearChat() {
    if (!confirm('Удалить всю историю сообщений?')) return;
    
    try {
        // Загружаем все сообщения чтобы получить их ID
        const response = await fetch(API_URL);
        const messages = await response.json();
        
        // Удаляем каждое сообщение (кроме первого системного)
        for (const msg of messages) {
            if (msg.id !== 1) { // Не удаляем первое системное сообщение
                await fetch(`${API_URL}/${msg.id}`, {
                    method: 'DELETE'
                });
            }
        }
        
        addSystemMessage('История чата очищена');
        setTimeout(loadMessages, 1000);
        
    } catch (error) {
        console.error('Ошибка очистки:', error);
        addSystemMessage('Ошибка очистки чата');
    }
}

// Закрыть модальное окно при клике вне его
document.addEventListener('click', (e) => {
    const modal = document.getElementById('apiModal');
    if (e.target === modal) {
        hideApiInfo();
    }
});

// Закрыть по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideApiInfo();
    }
});