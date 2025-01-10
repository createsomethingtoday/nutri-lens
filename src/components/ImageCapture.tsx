'use client'

import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'
import { parseNutritionText, formatNutritionFacts } from '../utils/nutritionParser'

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
    const files = event.target.files
    console.log('Files:', files)
    const file = files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        console.log('Valid image file selected:', file.type)
        processImage(file)
      } else {
        console.log('Invalid file type:', file.type)
        setError('Please select an image file.')
      }
    } else {
      console.log('No file selected')
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
    if (!fileInputRef.current) {
      console.error('File input ref is null')
      return
    }
    console.log('File input ref exists, triggering click')
    fileInputRef.current.click()
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
            <img 
              src={preview} 
              alt="Nutrition label preview" 
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
          <button 
            type="button"
            className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload image"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload nutrition label image"
            />
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-blue-500 rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-gray-900">Click to upload</p>
                <p className="text-sm text-gray-500">or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {error && (
              <p className="mt-4 text-red-500 text-center text-sm bg-red-50 px-4 py-2 rounded-lg" role="alert">
                {error}
              </p>
            )}
          </button>
        )}
      </div>
    </div>
  )
} 