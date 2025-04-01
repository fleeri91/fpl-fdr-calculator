import { Fixture } from '@/types/FPL/FPLFixture'
import { BootstrapStatic } from '@/types/BootstrapStatic'

const BASE_URL = '/api'

export const fetchBootstrapStatic = async (): Promise<BootstrapStatic> => {
  const response = await fetch(`${BASE_URL}/bootstrap-static`)
  if (!response.ok) {
    throw new Error('Failed to fetch bootstrap data')
  }
  return response.json()
}

export const fetchFixtures = async (): Promise<Fixture[]> => {
  const response = await fetch(`${BASE_URL}/fixtures`)
  if (!response.ok) {
    throw new Error('Failed to fetch fixtures')
  }
  return response.json()
}
