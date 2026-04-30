import { HomepageClient } from '@/components/public/homepage-client';
import { getHomepageData } from '@/lib/public/home';

export default async function HomePage() {
  const data = await getHomepageData();

  return <HomepageClient data={data} />;
}
