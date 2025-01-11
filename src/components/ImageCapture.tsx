'use client'

import { useState, useRef } from 'react'
import { analyzeImageWithVision } from '../services/openai'

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

      // Convert file to base64 for Vision API
      const base64Reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        base64Reader.onload = () => {
          const base64 = (base64Reader.result as string).split(',')[1]
          resolve(base64)
        }
        base64Reader.onerror = reject
      })
      base64Reader.readAsDataURL(file)
      
      const base64Data = await base64Promise
      console.log('Image converted to base64')

      // Process with Vision API
      console.log('Starting Vision API processing')
      try {
        const result = await analyzeImageWithVision(base64Data, (chunk) => {
          console.log('Received chunk:', chunk)
          // You could update a state variable here to show streaming progress if desired
        })
        
        console.log('Vision processing complete, result:', result)
        if (result) {
          onIngredientsDetected(result)
        } else {
          throw new Error('No result received from Vision API')
        }
      } catch (apiError) {
        console.error('Vision API Error:', apiError)
        setError(apiError instanceof Error ? apiError.message : 'Failed to process image with Vision API')
      }
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
    <div className="space-y-4 w-full max-w-3xl mx-auto">
      <div 
        className={`relative aspect-[3/4] sm:aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all duration-300 ${
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
              <div className="absolute inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center">
                <div className="relative flex flex-col items-center space-y-4 p-8 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg">
                  <div className="flex space-x-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500/80 animate-[pulse_1.5s_ease-in-out_0ms_infinite]" />
                    <div className="w-4 h-4 rounded-full bg-blue-500/80 animate-[pulse_1.5s_ease-in-out_200ms_infinite]" />
                    <div className="w-4 h-4 rounded-full bg-blue-500/80 animate-[pulse_1.5s_ease-in-out_400ms_infinite]" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">Analyzing nutrition label...</p>
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur opacity-50 group-hover:opacity-75 transition" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            type="button"
            className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload image"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload nutrition label image"
            />
            <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-sm">
              <div className="p-3 sm:p-4 bg-blue-500 rounded-full text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upload Nutrition Label</h3>
                <p className="text-sm sm:text-base text-gray-600">Take a photo or upload an image of a nutrition facts label</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Clear photo
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                    Good lighting
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                    Entire label
                  </span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Your data is processed locally
              </div>
            </div>
            {error && (
              <p className="absolute bottom-4 left-4 right-4 text-red-500 text-center text-xs sm:text-sm bg-red-50 px-4 py-2 rounded-lg" role="alert">
                {error}
              </p>
            )}
          </button>
        )}
      </div>
    </div>
  )
} 