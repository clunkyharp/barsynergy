import { getActiveCityOptions, type CityOption } from '@/lib/shared/city-options';

export type ApplicationCityOption = CityOption;

export async function getApplicationCityOptions(): Promise<ApplicationCityOption[]> {
  return getActiveCityOptions();
}
