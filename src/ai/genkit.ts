import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

function getApiKey() {
  // First try to get from environment variable
  const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (envKey) {
    return envKey;
  }
  
  // Fallback to cookie for client-side (existing functionality)
  if (typeof window !== 'undefined') {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('gemini_api_key='));
    if (cookie) {
      return cookie.split('=')[1];
    }
  }
  
  return '';
}

export const ai = genkit({
  plugins: [googleAI({
    apiKey: getApiKey(),
  })],
  model: 'googleai/gemini-2.0-flash',
});
