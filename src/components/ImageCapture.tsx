'use client'

import React from 'react'
import { useState, useRef, ChangeEvent } from 'react'
import { createWorker } from 'tesseract.js'

interface ImageCaptureProps {
  onIngredientsDetected: (text: string) => void
}

export default function ImageCapture({ onIngredientsDetected }: ImageCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setUploadedImage(URL.createObjectURL(file))

    try {
      const worker = await createWorker('eng')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      onIngredientsDetected(text)
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setUploadedImage(URL.createObjectURL(file))

    try {
      const worker = await createWorker('eng')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      onIngredientsDetected(text)
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        ref={fileInputRef}
      />
      {!uploadedImage ? (
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={isProcessing}
          >
            Upload Image
          </button>
          <p className="mt-2 text-gray-500">or drag and drop an image here</p>
        </div>
      ) : (
        <div>
          <img
            src={uploadedImage}
            alt="Uploaded ingredient label"
            className="max-w-full h-auto mx-auto mb-4"
          />
          {isProcessing ? (
            <p className="text-gray-500">Processing image...</p>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Upload Another Image
            </button>
          )}
        </div>
      )}
    </div>
  )
} 