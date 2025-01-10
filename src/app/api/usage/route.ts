import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

const USAGE_KEY = 'app:usage'

// Get current usage
async function getUsage() {
  const usage = await kv.hgetall(USAGE_KEY)
  return usage || { imageUploads: 0, chatInteractions: 0 }
}

export async function GET() {
  const usage = await getUsage()
  return NextResponse.json(usage)
}

export async function POST(request: Request) {
  const { type } = await request.json()
  
  if (type === 'image') {
    await kv.hincrby(USAGE_KEY, 'imageUploads', 1)
  } else if (type === 'chat') {
    await kv.hincrby(USAGE_KEY, 'chatInteractions', 1)
  }
  
  const usage = await getUsage()
  return NextResponse.json(usage)
} 