const API_URL = '/api/chat';
let currentUserName = localStorage.getItem('chatUserName') || '';

document.addEventListener('DOMContentLoaded', () => {
    if (currentUserName) {
        showChatInterface();
    } else {
        showNameInput();
    }
    loadMessages();
});

function showNameInput() {
    document.getElementById('nameInputContainer').style.display = 'block';
    document.getElementById('chatMain').style.display = 'none';
}

function showChatInterface() {
    document.getElementById('nameInputContainer').style.display = 'none';
    document.getElementById('chatMain').style.display = 'flex';
    document.getElementById('currentUserName').textContent = currentUserName;
    document.getElementById('messageInput').focus();
}

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
    
    addMessageToChat(
        `Привет, ${name}! Я Express-бот. Я могу ответить на многие вопросы! Попробуйте спросить:`,
        true,
        'Бот'
    );
    
    setTimeout(() => {
        addMessageToChat(
            "• Как дела?\n• Что такое Express?\n• Который час?\n• Что ты умеешь?\n• Расскажи о себе",
            true,
            'Бот'
        );
    }, 500);
}

function changeUserName() {
    if (confirm('Сменить имя? Текущая история сообщений сохранится.')) {
        currentUserName = '';
        localStorage.removeItem('chatUserName');
        showNameInput();
        document.getElementById('userNameInput').value = '';
        document.getElementById('userNameInput').focus();
    }
}

function showApiInfo() {
    document.getElementById('apiModal').style.display = 'flex';
}

function hideApiInfo() {
    document.getElementById('apiModal').style.display = 'none';
}

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

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    addMessageToChat(text, false, currentUserName);
    input.value = '';
    input.focus();
    
    try {
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
        
        setTimeout(loadMessages, 1500);
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        addSystemMessage('Ошибка отправки сообщения');
    }
}

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

function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

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

async function clearChat() {
    if (!confirm('Удалить всю историю сообщений?')) return;
    
    try {
        const response = await fetch(API_URL);
        const messages = await response.json();

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

document.addEventListener('click', (e) => {
    const modal = document.getElementById('apiModal');
    if (e.target === modal) {
        hideApiInfo();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideApiInfo();
    }

});
