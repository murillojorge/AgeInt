/**
 * Configuration for the AgeInt AI Chatbot
 * This file contains settings for connecting to Ollama services
 */

// Load environment variables if present
require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  // Ollama service configuration
  ollama: {
    // Use environment variables if available, otherwise use defaults
    host: process.env.OLLAMA_HOST || 'localhost',
    port: process.env.OLLAMA_PORT || 11434,
    protocol: process.env.OLLAMA_PROTOCOL || 'http',
    
    // Construct the base URL from components
    get baseUrl() {
      return `${this.protocol}://${this.host}:${this.port}`;
    },
    
    // API endpoints
    endpoints: {
      tags: '/api/tags',
      generate: '/api/generate'
    },
    
    // Default model to use
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'mistral',
    
    // Request timeout in milliseconds
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000', 10)
  }
};

module.exports = config;
