import { WeeklyFixture } from '@/types/WeeklyFixture'

export const fetchWeeklyFixtures = async (
  start: number,
  end: number
): Promise<WeeklyFixture[]> => {
  console.log('Fetching weekly fixtures...')

  // await delay(200 + Math.floor(Math.random() * 2000))

  return fetch(`api/weekly-fixtures?start=${start}&end=${end}`)
    .then((response) => {
      if (!response.ok) {
        return Promise.reject('Failed to fetch weekly fixtures')
      }
      return response.json()
    })
    .catch((error) => {
      console.error('Failed to fetch weekly fixtures:', error)
      return Promise.reject('Failed to load weekly fixtures')
    })
}
