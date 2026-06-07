/**
 * Backward-compat re-export facade.
 * New code should import from @/modules/content/vacancies/queries directly.
 */
export {
  getPublishedVacancies,
  getVacancyApplicationFormOptions,
  type VacancyApplicationFormOptions
} from '@/modules/content/vacancies/queries';
