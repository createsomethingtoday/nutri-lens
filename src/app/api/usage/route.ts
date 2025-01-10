import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

const USAGE_FILE = path.join(process.cwd(), 'data', 'usage.json');

// Ensure the data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Get current usage
async function getUsage() {
  await ensureDataDir();
  try {
    const data = await fs.readFile(USAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { imageUploads: 0, chatInteractions: 0 };
  }
}

// Save usage
async function saveUsage(usage: { imageUploads: number; chatInteractions: number }) {
  await ensureDataDir();
  await fs.writeFile(USAGE_FILE, JSON.stringify(usage));
}

export async function GET() {
  const usage = await getUsage();
  return NextResponse.json(usage);
}

export async function POST(request: Request) {
  const { type } = await request.json();
  const usage = await getUsage();
  
  if (type === 'image') {
    usage.imageUploads++;
  } else if (type === 'chat') {
    usage.chatInteractions++;
  }
  
  await saveUsage(usage);
  return NextResponse.json(usage);
} 