import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

function getApiKey() {
    if (typeof window !== 'undefined') {
      const cookie = document.cookie.split('; ').find(row => row.startsWith('gemini_api_key='));
      if (cookie) {
        return cookie.split('=')[1];
      }
    }
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
}

export const ai = genkit({
  plugins: [googleAI({
      apiKey: getApiKey(), // Execute a função para obter o valor da chave.
  })],
  model: 'googleai/gemini-2.0-flash',
});
