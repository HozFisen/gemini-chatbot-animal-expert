const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');

// Store conversation history for context
let conversation = [];

/**
 * Main function to send user message and get AI response
 */
async function sendMessage() {
    const text = userInput.value.trim();
    if (text === "") return;

    // 1. Add user message to chat
    addMessage(text, 'user-message');
    
    // 2. Clear input field
    userInput.value = '';

    // 3. Add user message to conversation history
    conversation.push({ role: 'user', text: text });

    // 4. Show "Thinking..." placeholder
    const thinkingMessage = addMessage('Thinking...', 'bot-message');
    thinkingMessage.classList.add('thinking');

    try {
        // 5. Send POST request to backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ conversation: conversation })
        });

        // 6. Check if response is OK
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // 7. Parse JSON response
        const data = await response.json();

        // 8. Remove "Thinking..." message
        thinkingMessage.remove();

        // 9. Handle response
        if (data.result) {
            // Add AI response to chat
            addMessage(data.result, 'bot-message');
            
            // Add AI response to conversation history
            conversation.push({ role: 'model', text: data.result });
        } else {
            // No result received
            addMessage('Sorry, no response received.', 'bot-message error-message');
        }

    } catch (error) {
        // 10. Handle errors
        console.error('Error fetching response:', error);
        
        // Remove "Thinking..." message
        thinkingMessage.remove();
        
        // Show error message
        addMessage('Failed to get response from server.', 'bot-message error-message');
    }
}

/**
 * Add a message to the chat history
 * @param {string} text - The message text
 * @param {string} className - CSS class for styling (user-message or bot-message)
 * @returns {HTMLElement} The created message element
 */
function addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    messageDiv.textContent = text;
    chatHistory.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    return messageDiv;
}

// Allow pressing "Enter" to send
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.textContent = '☀️';
}

// Toggle theme on button click
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    // Update icon and save preference
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
});
