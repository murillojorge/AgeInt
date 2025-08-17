# AgeInt AI Chatbot

A web-based chatbot application that integrates with Ollama to provide AI-powered conversations.

## Overview

AgeInt AI Chatbot is a simple yet powerful web application that connects to locally running Ollama models to provide an interactive chat experience. The application features:

- Modern, responsive UI built with HTML, CSS, and JavaScript
- Backend server built with Express.js
- Integration with Ollama's API for AI model access
- Support for multiple AI models
- Real-time response metrics

## Prerequisites

Before installing this application, you need to have:

1. [Node.js](https://nodejs.org/) (v14 or higher)
2. [npm](https://www.npmjs.com/) (comes with Node.js)
3. [Ollama](https://ollama.ai/) installed and running locally

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AgeInt.git
   cd AgeInt
   ```

2. Install dependencies:
   ```bash
   cd chatbot
   npm install
   ```

3. Configure the application:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file with your preferred settings
   # For local Ollama, the defaults should work
   # For remote Ollama, update OLLAMA_HOST, OLLAMA_PORT, and OLLAMA_PROTOCOL
   ```

## Running the Application

1. Make sure Ollama is running on your machine (default port: 11434) or on the remote server specified in your configuration

2. Start the application:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
   (or the host/port you configured in your .env file)

## Using the Chatbot

1. Select an AI model from the dropdown menu (default: mistral)
2. Type your message in the input field
3. Press "Send" or hit Enter to send your message
4. View the AI's response in the chat window

## Configuration Options

The application can be configured using environment variables or a `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port for the web server | 3000 |
| HOST | Host for the web server | localhost |
| OLLAMA_HOST | Hostname of the Ollama service | localhost |
| OLLAMA_PORT | Port of the Ollama service | 11434 |
| OLLAMA_PROTOCOL | Protocol for Ollama service (http/https) | http |
| OLLAMA_DEFAULT_MODEL | Default model to use | mistral |
| OLLAMA_TIMEOUT | Request timeout in milliseconds | 30000 |

## Available API Endpoints

- `GET /test-ollama`: Test connection to Ollama
- `GET /api/models`: Get list of available Ollama models
- `POST /api/generate`: Generate a response from the selected model

## Troubleshooting

If you encounter issues:

1. Ensure Ollama is running properly:
   ```bash
   curl http://localhost:11434/api/tags
   ```
   (adjust the URL if using a remote Ollama instance)

2. Check the server logs for any error messages

3. Make sure you have at least one model downloaded in Ollama:
   ```bash
   ollama list
   ```

4. Verify your .env configuration matches your Ollama setup

## Project Structure

```
chatbot/
├── public/
│   ├── index.html    # Frontend UI
│   └── script.js     # Frontend JavaScript
├── config.js         # Configuration settings
├── .env.example      # Example environment variables
├── package.json      # Project dependencies
└── server.js         # Express server and API endpoints
```

## License

[MIT License](LICENSE)
