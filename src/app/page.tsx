'use client'

import { useState, useEffect } from 'react'
import ImageCapture from '../components/ImageCapture'
import Chat from '../components/Chat'
import UsageCounter from '../components/UsageCounter'

export default function Home() {
  const [ingredients, setIngredients] = useState<string>('')
  const [imageUploads, setImageUploads] = useState(0)
  const [chatInteractions, setChatInteractions] = useState(0)

  // Load initial usage stats
  useEffect(() => {
    fetch('/api/usage')
      .then(res => res.json())
      .then(data => {
        setImageUploads(data.imageUploads)
        setChatInteractions(data.chatInteractions)
      })
      .catch(console.error)
  }, [])

  const handleIngredientsDetected = async (ingredients: string) => {
    setIngredients(ingredients)
    const res = await fetch('/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'image' })
    })
    const data = await res.json()
    setImageUploads(data.imageUploads)
  }

  const handleChatInteraction = async () => {
    const res = await fetch('/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'chat' })
    })
    const data = await res.json()
    setChatInteractions(data.chatInteractions)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white/60 to-purple-50/30">
      <UsageCounter imageUploads={imageUploads} chatInteractions={chatInteractions} />
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="space-y-6 animate-fade-in backdrop-blur-md bg-white/40 p-8 rounded-3xl border border-white/30 shadow-lg">
          <ImageCapture onIngredientsDetected={handleIngredientsDetected} />
          {ingredients && (
            <div className="animate-slide-up mt-8 border-t border-white/30 pt-8">
              <Chat ingredients={ingredients} onInteraction={handleChatInteraction} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 