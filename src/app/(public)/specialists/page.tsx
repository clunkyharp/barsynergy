import { redirect } from 'next/navigation';

export default function SpecialistsPage() {
  redirect('/vacancies?view=specialists');
}
