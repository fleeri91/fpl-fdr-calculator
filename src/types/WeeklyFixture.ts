export type WeeklyFixtureRoot = WeeklyFixture[]

export interface WeeklyFixture {
  id: number
  gameweek: number
  homeTeam: string
  homeFDR: number
  awayTeam: string
  awayFDR: number
}
