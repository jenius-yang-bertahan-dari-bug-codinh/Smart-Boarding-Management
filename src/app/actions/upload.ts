'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import fs from 'fs';

export async function uploadImages(formData: FormData) {
  try {
    const files = formData.getAll('images') as File[];
    if (!files || files.length === 0) {
      return { success: false, error: 'No files uploaded' };
    }

    if (files.length > 3) {
      return { success: false, error: 'Maximum 3 images allowed' };
    }

    const uploadDir = join(process.cwd(), 'public/uploads/rooms');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        return { success: false, error: 'Only PNG and JPEG images are allowed' };
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const uniqueName = crypto.randomBytes(16).toString('hex') + '.' + fileExt;
      const path = join(uploadDir, uniqueName);

      // Write to public folder
      await writeFile(path, buffer);
      
      // Store relative url
      uploadedUrls.push(`/uploads/rooms/${uniqueName}`);
    }

    return { success: true, data: uploadedUrls };
  } catch (error: any) {
    console.error('Error uploading images:', error);
    return { success: false, error: 'Failed to upload images' };
  }
}
