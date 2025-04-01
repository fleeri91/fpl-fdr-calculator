import { NextResponse } from 'next/server'
import { FPLBootstrapStaticRoot } from '@/types/FPL/FPLBootstrapStatic'
import { BootstrapStatic } from '@/types/BootstrapStatic'

const FPL_BASE_URL = process.env.NEXT_PUBLIC_API_FPL

export async function GET() {
  try {
    const response = await fetch(`${FPL_BASE_URL}/bootstrap-static/`)
    if (!response.ok) {
      throw new Error('Failed to fetch bootstrap data')
    }
    const data: FPLBootstrapStaticRoot = await response.json()

    const currentEvent = data.events.find((event) => event.is_current)
    const currentGameweek = currentEvent ? currentEvent.id : 1

    const trimmedData: BootstrapStatic = {
      teams: data.teams,
      currentGameweek,
    }

    return NextResponse.json(trimmedData, { status: 200 })
  } catch (error) {
    console.error(
      'Error fetching bootstrap data:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return NextResponse.json(
      {
        error: 'Failed to fetch bootstrap data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
