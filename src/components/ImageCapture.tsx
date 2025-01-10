'use client'

import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'
import { parseNutritionText, formatNutritionFacts } from '../utils/nutritionParser'
import Image from 'next/image'

interface Props {
  onIngredientsDetected: (ingredients: string) => void
}

export default function ImageCapture({ onIngredientsDetected }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = async (file: File) => {
    console.log('Processing image:', file.name)
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log('Preview created')
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Process with Tesseract
      console.log('Starting Tesseract processing')
      const worker = await createWorker('eng')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      console.log('Tesseract processing complete')
      
      // Parse and format the nutrition facts
      console.log('Raw text:', text)
      const nutritionFacts = parseNutritionText(text)
      const formattedText = formatNutritionFacts(nutritionFacts)
      console.log('Formatted text:', formattedText)
      
      onIngredientsDetected(formattedText)
    } catch (err) {
      console.error('Error processing image:', err)
      setError(err instanceof Error ? err.message : 'Error processing image. Please try again with a clearer image.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event triggered')
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        console.log('Valid image file selected:', file.type)
        processImage(file)
      } else {
        console.log('Invalid file type:', file.type)
        setError('Please select an image file.')
      }
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    console.log('File drop event triggered')
    const file = event.dataTransfer.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        console.log('Valid image file dropped:', file.type)
        processImage(file)
      } else {
        console.log('Invalid file type:', file.type)
        setError('Please drop an image file.')
      }
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleUploadClick = () => {
    console.log('Upload button clicked')
    console.log('File input ref:', fileInputRef.current)
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div 
        className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all duration-300 ${
          preview ? 'border-transparent' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {preview ? (
          <div className="relative w-full h-full bg-gray-50">
            <Image
              src={preview}
              alt="Nutrition label preview"
              width={400}
              height={300}
              className="w-full h-full object-contain"
            />
            {isProcessing && (
              <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4 text-white">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100" />
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200" />
                  </div>
                  <p className="text-sm font-medium">Processing image...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gray-50">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload nutrition label image"
            />
            <button
              type="button"
              onClick={handleUploadClick}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
              aria-label="Upload image button"
            >
              Upload Image
            </button>
            <p className="mt-4 text-gray-500 text-center text-sm">
              or drag and drop a nutrition label image
            </p>
            {error && (
              <p className="mt-4 text-red-500 text-center text-sm bg-red-50 px-4 py-2 rounded-lg" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 