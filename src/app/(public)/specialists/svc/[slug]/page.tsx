import { permanentRedirect } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

// Master services are canonical under /masters/[slug]; this legacy path 301s there.
export default async function MasterServiceRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/masters/${slug}`);
}
