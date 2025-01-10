'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { analyzeNutrition } from '../services/openai'

interface Props {
  ingredients: string
  onInteraction?: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

export default function Chat({ ingredients, onInteraction }: Props) {
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

    onInteraction?.();
    
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
    <div className="backdrop-blur-sm bg-white/30 border border-white/30 rounded-xl overflow-hidden">
      <div className="h-[500px] overflow-y-auto p-2 md:p-6 space-y-4 md:space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[95%] md:max-w-[80%] rounded-2xl p-2 md:p-4 backdrop-blur-sm border ${
                message.role === 'user'
                  ? 'bg-blue-500/80 text-white border-blue-400/30'
                  : 'bg-white/50 border-white/30'
              }`}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                className={`prose prose-sm max-w-none ${
                  message.role === 'user' 
                    ? 'prose-invert' 
                    : 'prose-slate'
                } prose-headings:font-bold prose-h2:text-lg prose-h3:text-base prose-p:text-sm prose-ul:text-sm prose-li:text-sm prose-table:text-xs md:prose-table:text-sm [&_table]:border [&_th]:border [&_td]:border [&_table]:border-collapse`}
                components={{
                  p: ({ children }) => {
                    const isTable = children?.toString().startsWith('|');
                    if (isTable) {
                      return <div>{children}</div>;
                    }
                    return <p className="mb-4">{children}</p>;
                  },
                  table: ({ ...props }) => (
                    <div className="my-4 overflow-x-auto relative group">
                      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                      <table {...props} className="min-w-full table-auto" />
                    </div>
                  ),
                  thead: ({ ...props }) => (
                    <thead {...props} className="bg-gray-50/50" />
                  ),
                  tbody: ({ ...props }) => (
                    <tbody {...props} className="divide-y divide-gray-200/50" />
                  ),
                  tr: ({ ...props }) => (
                    <tr {...props} className="hover:bg-gray-50/30" />
                  ),
                  th: ({ ...props }) => (
                    <th {...props} className="px-2 py-1 md:px-4 md:py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
                  ),
                  td: ({ ...props }) => (
                    <td {...props} className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm text-gray-900 whitespace-nowrap" />
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
      
      <div className="border-t border-white/30 p-2 md:p-4 bg-white/20 backdrop-blur-sm">
        <form onSubmit={sendMessage} className="flex flex-col md:flex-row gap-2 md:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the nutrition facts..."
            className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base bg-white/50 backdrop-blur-sm border border-gray-300/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`py-2 md:px-6 rounded-lg font-medium text-sm md:text-base transition-all duration-200 backdrop-blur-sm shrink-0 ${
              isLoading 
                ? 'bg-gray-200/50 text-gray-500 cursor-not-allowed border border-white/30'
                : 'bg-blue-500/80 text-white hover:bg-blue-600/80 border border-blue-400/30'
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