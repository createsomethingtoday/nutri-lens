import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error('UPSTASH_REDIS_REST_URL is not defined')
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined')
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const USAGE_KEY = 'app:usage'

// Get current usage
async function getUsage() {
  const usage = await redis.hgetall(USAGE_KEY)
  return usage || { imageUploads: 0, chatInteractions: 0 }
}

export async function GET() {
  const usage = await getUsage()
  return NextResponse.json(usage)
}

export async function POST(request: Request) {
  const { type } = await request.json()
  
  if (type === 'image') {
    await redis.hincrby(USAGE_KEY, 'imageUploads', 1)
  } else if (type === 'chat') {
    await redis.hincrby(USAGE_KEY, 'chatInteractions', 1)
  }
  
  const usage = await getUsage()
  return NextResponse.json(usage)
} 