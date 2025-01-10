'use client'

import { useState } from 'react'
import ImageCapture from '../components/ImageCapture'
import Chat from '../components/Chat'

export default function Home() {
  const [ingredients, setIngredients] = useState<string>('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white/60 to-purple-50/30">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="space-y-6 animate-fade-in backdrop-blur-md bg-white/40 p-8 rounded-3xl border border-white/30 shadow-lg">
          <ImageCapture onIngredientsDetected={setIngredients} />
          {ingredients && (
            <div className="animate-slide-up mt-8 border-t border-white/30 pt-8">
              <Chat ingredients={ingredients} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 