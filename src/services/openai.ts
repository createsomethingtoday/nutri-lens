import OpenAI from 'openai';
import type { ChatCompletionChunk } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeNutrition(
  nutritionText: string, 
  userQuestion: string,
  onProgress?: (chunk: string) => void
) {
  try {
    if (onProgress) {
      // Handle streaming
      const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a knowledgeable nutritionist analyzing food labels. 
              Provide clear, accurate information about nutritional content and its implications for health. 
              Keep responses concise and focused on the specific question asked.
              Use markdown formatting for better readability.
              Always include relevant nutritional values from the label in your response.`
          },
          {
            role: "user",
            content: `Here are the nutrition facts:\n${nutritionText}\n\nUser's question: ${userQuestion}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        onProgress(content);
      }
      return null;
    } else {
      // Handle regular response
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a knowledgeable nutritionist analyzing food labels. 
              Provide clear, accurate information about nutritional content and its implications for health. 
              Keep responses concise and focused on the specific question asked.
              Use markdown formatting for better readability.
              Always include relevant nutritional values from the label in your response.`
          },
          {
            role: "user",
            content: `Here are the nutrition facts:\n${nutritionText}\n\nUser's question: ${userQuestion}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      return completion.choices[0]?.message?.content || 
        "I couldn't analyze the nutrition information. Please try again.";
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    const message = error instanceof Error ? error.message : 
      "Sorry, I encountered an error while analyzing the nutrition information. Please try again.";
    if (onProgress) {
      onProgress(message);
      return null;
    }
    return message;
  }
} 