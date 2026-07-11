import { getActiveCityOptions } from '@/lib/shared/city-options';

export async function getActiveCities() {
  return getActiveCityOptions();
}
