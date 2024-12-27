import React, { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ShortestRouteFinder = () => {
  const [geminiResponse, setGeminiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestCount, setRequestCount] = useState(0); // Track the number of requests
  const [lastRequestTime, setLastRequestTime] = useState(Date.now()); // Track the last request time

  // Initialize the GoogleGenerativeAI with your API key
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY); // Use your actual environment variable here
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const fetchGeminiResponse = async () => {
    const currentTime = Date.now();

    // Check if the limit of 15 requests per minute is exceeded
    if (requestCount >= 15 && currentTime - lastRequestTime < 60000) {
      setError('Request limit exceeded. Please wait before trying again.');
      return;
    }

    // Reset the counter after 1 minute
    if (currentTime - lastRequestTime >= 60000) {
      setRequestCount(0);
      setLastRequestTime(currentTime);
    }

    try {
      setLoading(true);
      setRequestCount((prevCount) => prevCount + 1); // Increment the request counter

      const prompt = "Why is there a lot traffic on ghodbandar road?"; // Customize the prompt
      const result = await model.generateContent(prompt);

      setGeminiResponse(result.response.text()); // Set the response content
    } catch (err) {
      setError(`Failed to fetch Gemini response: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeminiResponse(); // Call the API when the component mounts
  }, []);

  return (
    <div>
      <h1>Shortest Route Finder - Gemini API Example</h1>

      {/* Display loading state */}
      {loading && <p>Loading...</p>}

      {/* Display error state */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display response from Gemini API */}
      {geminiResponse && (
        <div>
          <h2>Response from Gemini API:</h2>
          <pre>{geminiResponse}</pre> {/* Display the generated content */}
        </div>
      )}
    </div>
  );
};

export default ShortestRouteFinder;
