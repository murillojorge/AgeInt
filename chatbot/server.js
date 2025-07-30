const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Test Ollama connection
app.get('/test-ollama', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    res.json({
      status: 'success',
      message: 'Connected to Ollama successfully',
      data: response.data
    });
  } catch (error) {
    console.error('Error connecting to Ollama:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to Ollama',
      error: error.message
    });
  }
});

// Direct implementation of the generate endpoint
app.post('/api/generate', async (req, res) => {
  try {
    console.log('Received request for /api/generate:', req.body);
    
    // Make the request to Ollama
    const response = await axios.post('http://localhost:11434/api/generate', req.body, {
      responseType: 'text' // Get raw text response
    });
    
    console.log('Ollama response received');
    
    // Handle Ollama's streaming response format
    try {
      // The response is a series of JSON objects separated by newlines
      // We need to extract and concatenate all the response parts
      const responseText = response.data;
      const jsonObjects = responseText.trim().split(/\s*}\s*{/).map((part, index) => {
        // Add back the braces that were removed by the split
        if (index === 0) {
          return part + '}';
        } else if (index === responseText.split(/\s*}\s*{/).length - 1) {
          return '{' + part;
        } else {
          return '{' + part + '}';
        }
      });
      
      // Parse each JSON object and extract the response parts
      let fullResponse = '';
      let isDone = false;
      
      for (const jsonStr of jsonObjects) {
        try {
          // Make sure we have valid JSON
          const cleanJsonStr = jsonStr.trim();
          if (!cleanJsonStr.startsWith('{') || !cleanJsonStr.endsWith('}')) {
            continue;
          }
          
          const jsonObj = JSON.parse(cleanJsonStr);
          
          // Concatenate the response parts
          if (jsonObj.response !== undefined) {
            fullResponse += jsonObj.response;
          }
          
          // Check if this is the final response part
          if (jsonObj.done === true) {
            isDone = true;
          }
        } catch (innerError) {
          console.error('Error parsing JSON object:', innerError, jsonStr);
          // Continue with the next object
        }
      }
      
      console.log('Extracted full response:', fullResponse);
      
      // Clean up the response - remove any system prompts
      let cleanResponse = fullResponse.trim();
      
      // List of common prefixes to remove
      const prefixesToRemove = [
        'I am an AI assistant',
        'I\'m an AI assistant',
        'As an AI assistant',
        'As an AI language model',
        'I\'m a language model',
        'I am a language model',
      ];
      
      // Remove common prefixes
      for (const prefix of prefixesToRemove) {
        if (cleanResponse.startsWith(prefix)) {
          const endOfSentence = cleanResponse.indexOf('.', prefix.length);
          if (endOfSentence !== -1) {
            cleanResponse = cleanResponse.substring(endOfSentence + 1).trim();
          }
        }
      }
      
      // Send the clean, concatenated response
      res.json({
        response: cleanResponse,
        model: req.body.model,
        done: isDone
      });
    } catch (parseError) {
      console.error('Error processing Ollama response:', parseError);
      // If we can't parse it, just send the raw response as text
      res.json({
        response: 'Sorry, I had trouble understanding the response. Please try again.',
        model: req.body.model,
        error: parseError.message
      });
    }
  } catch (error) {
    console.error('Error proxying to Ollama:', error.message);
    if (error.response) {
      console.error('Ollama response error:', error.response.data);
    }
    res.status(500).json({
      error: 'Failed to connect to Ollama',
      details: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Test Ollama connection at http://localhost:${PORT}/test-ollama`);
});
