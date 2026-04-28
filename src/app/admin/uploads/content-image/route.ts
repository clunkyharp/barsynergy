import { NextResponse } from 'next/server';
import { uploadPublicContentImageFromFormData } from '@/lib/admin/content-utils';
import { getCurrentUser } from '@/lib/auth/current-user';
import { canAccessAdminSection } from '@/lib/auth/permissions';

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!canAccessAdminSection(user.role, 'dashboard')) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const formData = await request.formData();
  if (!(formData.get('file') instanceof File)) {
    return NextResponse.json({ error: 'File is required.' }, { status: 400 });
  }

  try {
    const upload = await uploadPublicContentImageFromFormData(formData, 'file', user.id);

    if (!upload) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    return NextResponse.json(upload);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed.' }, { status: 400 });
  }
}
