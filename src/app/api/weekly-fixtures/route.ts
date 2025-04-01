import { NextResponse } from 'next/server'

const FPL_BASE_URL = process.env.NEXT_PUBLIC_API_FPL

export async function GET() {
  try {
    // Fetch bootstrap data (for team names)
    const bootstrapResponse = await fetch(`${FPL_BASE_URL}/bootstrap-static`)
    if (!bootstrapResponse.ok) {
      throw new Error('Failed to fetch bootstrap data')
    }
    const bootstrapData = await bootstrapResponse.json()
    const teams = bootstrapData.teams.reduce((acc, team) => {
      acc[team.id] = team.name
      return acc
    }, {})

    // Fetch fixtures data (includes FDR)
    const fixturesResponse = await fetch(`${FPL_BASE_URL}/fixtures`)
    if (!fixturesResponse.ok) {
      throw new Error('Failed to fetch fixtures data')
    }
    const fixturesData = await fixturesResponse.json()

    // Get current gameweek (simplified: using the first uncompleted gameweek)
    const currentGameweek =
      bootstrapData.events.find((event) => !event.finished)?.id || 1

    // Filter fixtures for the current gameweek and format the response
    const weeklyFixtures = fixturesData
      .filter((fixture) => fixture.event === currentGameweek)
      .map((fixture) => ({
        gameweek: fixture.event,
        homeTeam: teams[fixture.team_h],
        homeFDR: fixture.team_h_difficulty,
        awayTeam: teams[fixture.team_a],
        awayFDR: fixture.team_a_difficulty,
      }))

    // Return the formatted data
    return NextResponse.json(weeklyFixtures, { status: 200 })
  } catch (error) {
    // Log the error for debugging (optional)
    console.error('Error fetching FPL data:', error.message)

    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch weekly fixtures', details: error.message },
      { status: 500 }
    )
  }
}
