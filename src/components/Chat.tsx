'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { analyzeNutrition } from '../services/openai'

interface Props {
  ingredients: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

export default function Chat({ ingredients }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: ingredients,
      id: 'initial'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      id: Date.now().toString()
    }
    
    setMessages(messages => [...messages, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()
    setMessages(messages => [
      ...messages,
      {
        role: 'assistant',
        content: '',
        id: assistantMessageId
      }
    ])

    try {
      let streamedContent = ''
      console.log('[Chat] Starting nutrition analysis...');
      await analyzeNutrition(
        ingredients,
        input,
        (chunk) => {
          streamedContent += chunk
          console.log('[Chat] Received chunk:', JSON.stringify(chunk));
          setMessages(messages => {
            const updatedMessages = messages.map(msg => 
              msg.id === assistantMessageId
                ? { ...msg, content: streamedContent }
                : msg
            );
            console.log('[Chat] Updated message content:', streamedContent);
            return updatedMessages;
          });
        }
      )
    } catch (error) {
      console.error('[Chat] Error:', error)
      setMessages(messages => messages.map(msg => 
        msg.id === assistantMessageId
          ? { ...msg, content: "I'm sorry, I encountered an error while analyzing the nutrition information. Please try again." }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl shadow-lg bg-white overflow-hidden">
      <div className="h-[500px] overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                className={`prose prose-sm max-w-none ${
                  message.role === 'user' 
                    ? 'prose-invert' 
                    : 'prose-gray'
                } prose-headings:font-bold prose-h2:text-lg prose-h3:text-base prose-p:text-sm prose-ul:text-sm prose-li:text-sm prose-table:text-sm [&_table]:border [&_th]:border [&_td]:border [&_table]:border-collapse`}
                components={{
                  p: ({ children }) => {
                    const isTable = children?.toString().startsWith('|');
                    if (isTable) {
                      return <div>{children}</div>;
                    }
                    return <p className="mb-4">{children}</p>;
                  },
                  table: ({ ...props }) => (
                    <div className="my-4 overflow-x-auto">
                      <table {...props} className="min-w-full table-auto" />
                    </div>
                  ),
                  thead: ({ ...props }) => (
                    <thead {...props} className="bg-gray-50" />
                  ),
                  tbody: ({ ...props }) => (
                    <tbody {...props} className="divide-y divide-gray-200" />
                  ),
                  tr: ({ ...props }) => (
                    <tr {...props} className="hover:bg-gray-50" />
                  ),
                  th: ({ ...props }) => (
                    <th {...props} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
                  ),
                  td: ({ ...props }) => (
                    <td {...props} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap" />
                  ),
                  a: ({ ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="underline" />
                  ),
                  code: ({ ...props }) => (
                    <code {...props} className="font-mono bg-black/10 rounded px-1" />
                  ),
                  pre: ({ ...props }) => (
                    <pre {...props} className="font-mono bg-black/10 rounded p-2 overflow-x-auto" />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the nutrition facts..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              isLoading 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md active:scale-95'
            }`}
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
} 