# NutriLens

A modern web application that uses AI to analyze nutrition labels and provide interactive insights about ingredients and nutritional content.

## Features

- 📸 Upload or drag-and-drop nutrition label images
- 🔍 OCR-powered label text extraction
- 💬 Interactive AI chat about nutritional content
- 📊 Beautiful, modern UI with real-time updates
- 📱 Mobile-friendly design

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- OpenAI GPT-4
- Tesseract.js for OCR
- React Markdown

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/createsomethingtoday/nutri-lens.git
   ```

2. Install dependencies:
   ```bash
   cd nutri-lens
   npm install
   ```

3. Create a `.env.local` file with your OpenAI API key:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click "Upload Image" or drag and drop a nutrition label image
2. Wait for the OCR processing to complete
3. Chat with the AI about the nutritional content
4. Get detailed insights about ingredients and nutrition facts

## License

MIT 