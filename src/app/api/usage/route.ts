import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const USAGE_KEY = 'app:usage'

// Initialize Redis only if environment variables are available
const getRedisClient = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis environment variables are not set')
    return null
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

const redis = getRedisClient()

// Get current usage
async function getUsage() {
  if (!redis) {
    return { imageUploads: 0, chatInteractions: 0 }
  }
  const usage = await redis.hgetall(USAGE_KEY)
  return usage || { imageUploads: 0, chatInteractions: 0 }
}

export async function GET() {
  const usage = await getUsage()
  return NextResponse.json(usage)
}

export async function POST(request: Request) {
  if (!redis) {
    return NextResponse.json(
      { error: 'Redis is not configured' },
      { status: 503 }
    )
  }

  const { type } = await request.json()
  
  if (type === 'image') {
    await redis.hincrby(USAGE_KEY, 'imageUploads', 1)
  } else if (type === 'chat') {
    await redis.hincrby(USAGE_KEY, 'chatInteractions', 1)
  }
  
  const usage = await getUsage()
  return NextResponse.json(usage)
} 