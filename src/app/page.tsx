'use client'

import { useState } from 'react'
import ImageCapture from '../components/ImageCapture'
import Chat from '../components/Chat'

export default function Home() {
  const [ingredients, setIngredients] = useState<string>('')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="space-y-6 animate-fade-in">
          <ImageCapture onIngredientsDetected={setIngredients} />
          {ingredients && (
            <div className="animate-slide-up">
              <Chat ingredients={ingredients} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 