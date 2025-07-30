document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const chatForm = document.getElementById('chatForm');
    const modelSelect = document.getElementById('modelSelect');
    const modelStatus = document.getElementById('modelStatus');

    // Store messages in memory
    let messages = [];
    let currentModel = 'mistral';

    // Function to add a message to the UI
    function addMessage(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to fetch available models
    async function fetchModels() {
        try {
            modelStatus.textContent = 'Loading models...';
            
            const response = await fetch('/api/models');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.models || !Array.isArray(data.models)) {
                throw new Error('Invalid models data');
            }
            
            // Clear existing options except the default
            while (modelSelect.options.length > 1) {
                modelSelect.remove(1);
            }
            
            // Add models to select dropdown
            data.models.forEach(model => {
                // Skip if it's already in the list (mistral)
                if (model.name === 'mistral') return;
                
                const option = document.createElement('option');
                option.value = model.name;
                option.textContent = model.name;
                modelSelect.appendChild(option);
            });
            
            modelStatus.textContent = `${data.models.length} models available`;
        } catch (error) {
            console.error('Error fetching models:', error);
            modelStatus.textContent = 'Failed to load models';
        }
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
            
            // Get the selected model
            const selectedModel = modelSelect.value;
            
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: selectedModel,
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
            messages.push({ 
                role: 'assistant', 
                content: data.response,
                model: selectedModel
            });
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

    // Handle model change
    modelSelect.addEventListener('change', () => {
        currentModel = modelSelect.value;
        addMessage(`Model changed to ${currentModel}`, false);
    });

    // Initialize with a welcome message
    addMessage('Welcome! Type your message to start chatting.', false);
    
    // Fetch available models
    fetchModels();
});
