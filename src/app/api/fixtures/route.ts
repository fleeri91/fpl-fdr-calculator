import { NextResponse } from 'next/server'

import { FixtureRoot } from '@/types/FPL/FPLFixture'

const FPL_BASE_URL = process.env.NEXT_PUBLIC_API_FPL

export async function GET() {
  try {
    const response = await fetch(`${FPL_BASE_URL}/fixtures/`)
    if (!response.ok) {
      throw new Error('Failed to fetch fixtures data')
    }
    const data: FixtureRoot = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(
      'Error fetching fixtures:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return NextResponse.json(
      {
        error: 'Failed to fetch fixtures',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
