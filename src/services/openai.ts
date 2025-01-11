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
  const systemPrompt = `You are a knowledgeable nutritionist analyzing food labels.
    IMPORTANT: Your response MUST be formatted in Markdown.
    
    Follow this structure:
    1. Start with a level-2 heading (##) for the main topic
    2. Use level-3 headings (###) for subtopics
    3. ALWAYS present nutritional data in tables with proper spacing:

    | Nutrient | Amount | Daily Value |
    |----------|---------|-------------|
    | Protein  | 20g     | 40%        |

    4. Use bullet lists for benefits or considerations
    5. Use **bold** for important values
    
    IMPORTANT: Always add empty lines before and after tables for proper formatting.
    
    Keep responses concise and focused on the question asked.`;

  console.log('[Input] Question:', userQuestion);
  console.log('[Input] Nutrition Text:', nutritionText);

  try {
    if (onProgress) {
      console.log('[Mode] Using streaming response');
      const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
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

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        console.log('[Stream Chunk]:', JSON.stringify(content));
        fullResponse += content;
        onProgress(content);
      }
      console.log('[Full Streamed Response]:', fullResponse);
      console.log('[Has Markdown]:', 
        fullResponse.includes('#') || 
        fullResponse.includes('|') || 
        fullResponse.includes('*') || 
        fullResponse.includes('-')
      );
      return null;
    }
    
    console.log('[Mode] Using regular response');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
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

    const response = completion.choices[0]?.message?.content || 
      "I couldn't analyze the nutrition information. Please try again.";
    
    console.log('[Regular Response]:', response);
    console.log('[Has Markdown]:', 
      response.includes('#') || 
      response.includes('|') || 
      response.includes('*') || 
      response.includes('-')
    );
    
    return response;
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

export async function analyzeImageWithVision(
  imageBase64: string,
  onProgress?: (chunk: string) => void
) {
  const systemPrompt = `You are a knowledgeable nutritionist analyzing nutrition labels.
    IMPORTANT: Your response MUST be formatted in Markdown.
    
    Follow this structure:
    1. Start with a level-2 heading (##) for the main topic
    2. Use level-3 headings (###) for subtopics
    3. ALWAYS present nutritional data in tables with proper spacing:

    | Nutrient | Amount | Daily Value |
    |----------|---------|-------------|
    | Protein  | 20g     | 40%        |

    4. Use bullet lists for benefits or considerations
    5. Use **bold** for important values
    
    IMPORTANT: Always add empty lines before and after tables for proper formatting.
    
    If you can't read certain values clearly, indicate that they are unclear rather than guessing.`;

  try {
    console.log('[Vision API] Starting request...');
    
    if (onProgress) {
      console.log('[Vision API] Using streaming mode');
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this nutrition label and extract all the nutritional information you can see. Format it clearly and indicate if any values are unclear."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        stream: true,
      });

      let fullResponse = '';
      console.log('[Vision API] Stream created, processing chunks...');
      
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          console.log('[Vision API] Received chunk:', content);
          fullResponse += content;
          onProgress(content);
        }
        console.log('[Vision API] Stream complete. Full response:', fullResponse);
        return fullResponse || "I couldn't analyze the nutrition information. Please try again with a clearer image.";
      } catch (streamError) {
        console.error('[Vision API] Stream processing error:', streamError);
        throw streamError;
      }
    }
    
    console.log('[Vision API] Using non-streaming mode');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this nutrition label and extract all the nutritional information you can see. Format it clearly and indicate if any values are unclear."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 
      "I couldn't analyze the nutrition information. Please try again with a clearer image.";
    console.log('[Vision API] Received response:', response);
    return response;
  } catch (error) {
    console.error('[Vision API] Error:', error);
    if (error instanceof Error) {
      console.error('[Vision API] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    const message = error instanceof Error ? error.message : 
      "Sorry, I encountered an error while analyzing the nutrition information. Please try again.";
    if (onProgress) {
      onProgress(message);
    }
    throw error;
  }
} 