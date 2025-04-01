'use client'

import { useQuery } from '@tanstack/react-query'
import { Flex, Text, Slider } from '@radix-ui/themes'
import { fetchBootstrapStatic, fetchFixtures } from '@/api'
import { useState, useMemo } from 'react'
import { Team } from '@/types/FPL/FPLBootstrapStatic'

const MAX_WEEK = 38

interface TeamWithFixtures {
  id: number
  name: string
  fixtures: {
    gameweek: number
    opponent: string
    isHome: boolean
    fdr: number
  }[]
  totalFDR: number // Add total FDR for sorting
}

const App = () => {
  const {
    data: bootstrapData,
    isPending: bootstrapPending,
    error: bootstrapError,
  } = useQuery({
    queryKey: ['bootstrap-static'],
    queryFn: fetchBootstrapStatic,
  })

  const {
    data: fixturesData,
    isPending: fixturesPending,
    error: fixturesError,
  } = useQuery({
    queryKey: ['fixtures'],
    queryFn: fetchFixtures,
  })

  // Calculate current and next gameweek
  const { currentGameweek, nextGameweek } = useMemo(() => {
    const current = bootstrapData?.currentGameweek ?? 1
    const next = current < MAX_WEEK ? current + 1 : current
    return { currentGameweek: current, nextGameweek: next }
  }, [bootstrapData])

  const [weekRange, setWeekRange] = useState<{ start: number; end: number }>({
    start: nextGameweek,
    end: MAX_WEEK,
  })

  // Adjust weekRange.start if it falls below nextGameweek
  useMemo(() => {
    if (weekRange.start < nextGameweek) {
      setWeekRange((prev) => ({ ...prev, start: nextGameweek }))
    }
  }, [nextGameweek, weekRange.start])

  // Combine teams and fixtures, calculate total FDR, and sort
  const teamsWithFixtures: TeamWithFixtures[] = useMemo(() => {
    if (!bootstrapData?.teams || !fixturesData) return []

    const teamsLookup: Record<number, string> = bootstrapData.teams.reduce(
      (acc, team) => {
        acc[team.id] = team.name
        return acc
      },
      {} as Record<number, string>
    )

    // Map teams to fixtures and calculate total FDR
    const unsortedTeams = bootstrapData.teams.map((team: Team) => {
      const teamFixtures = fixturesData
        .filter(
          (fixture) =>
            (fixture.team_h === team.id || fixture.team_a === team.id) &&
            fixture.event &&
            fixture.event >= weekRange.start &&
            fixture.event <= weekRange.end &&
            !fixture.finished
        )
        .map((fixture) => {
          const isHome = fixture.team_h === team.id
          return {
            gameweek: fixture.event!,
            opponent: isHome
              ? teamsLookup[fixture.team_a]
              : teamsLookup[fixture.team_h],
            isHome,
            fdr: isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty,
          }
        })

      // Calculate total FDR for this team
      const totalFDR = teamFixtures.reduce(
        (sum, fixture) => sum + fixture.fdr,
        0
      )

      return {
        id: team.id,
        name: team.name,
        fixtures: teamFixtures,
        totalFDR,
      }
    })

    // Sort teams by total FDR (ascending: easiest to hardest)
    return unsortedTeams.sort((a, b) => a.totalFDR - b.totalFDR)
  }, [bootstrapData, fixturesData, weekRange.start, weekRange.end])

  if (bootstrapPending || fixturesPending) {
    return <Text>Fetching data...</Text>
  }

  if (bootstrapError || fixturesError) {
    return <Text>Error: {(bootstrapError || fixturesError)?.message}</Text>
  }

  return (
    <Flex direction="column" gap="4" p="4">
      <Text>
        Gameweek Range: {weekRange.start} - {weekRange.end} (Current:{' '}
        {currentGameweek}, Next: {nextGameweek})
      </Text>
      <Slider
        value={[weekRange.start, weekRange.end]}
        min={nextGameweek}
        max={MAX_WEEK}
        step={1}
        onValueChange={(values: number[]) => {
          setWeekRange({
            start: Math.max(nextGameweek, values[0]),
            end: values[1],
          })
        }}
      />
      <Flex direction="column" gap="2">
        {teamsWithFixtures.map((team) => (
          <div key={team.id}>
            <Text weight="bold">
              {team.name} (Total FDR: {team.totalFDR})
            </Text>
            <ul>
              {team.fixtures.length > 0 ? (
                team.fixtures.map((fixture, idx) => (
                  <li key={idx}>
                    GW{fixture.gameweek}: vs {fixture.opponent} (
                    {fixture.isHome ? 'Home' : 'Away'}, FDR: {fixture.fdr})
                  </li>
                ))
              ) : (
                <li>No upcoming fixtures in this range</li>
              )}
            </ul>
          </div>
        ))}
      </Flex>
    </Flex>
  )
}

export default App
