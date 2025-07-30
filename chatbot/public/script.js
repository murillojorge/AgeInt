document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const chatForm = document.getElementById('chatForm');

    // Store messages in memory
    let messages = [];

    // Function to add a message to the UI
    function addMessage(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to send message to Ollama
    async function sendMessage(message) {
        try {
            addMessage(message, true); // Add user message
            
            // Show typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message assistant-message';
            typingDiv.textContent = 'Typing...';
            messagesContainer.appendChild(typingDiv);
            
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'mistral',
                    prompt: message,
                }),
            });

            // Remove typing indicator
            messagesContainer.removeChild(typingDiv);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            let data;
            
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                console.log('Raw response:', text);
                throw new Error('Invalid JSON response from server');
            }
            
            if (!data.response) {
                console.error('Unexpected response format:', data);
                throw new Error('Unexpected response format from server');
            }
            
            addMessage(data.response, false); // Add assistant message
            
            // Store conversation history
            messages.push({ role: 'user', content: message });
            messages.push({ role: 'assistant', content: data.response });
        } catch (error) {
            console.error('Error:', error);
            addMessage(`Sorry, there was an error: ${error.message}`, false);
        }
    }

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            sendMessage(message);
            messageInput.value = '';
        }
    });

    // Initialize with a welcome message
    addMessage('Welcome! Type your message to start chatting.', false);
});
