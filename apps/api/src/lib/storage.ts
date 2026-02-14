import { supabaseAdmin } from './supabase.js';
import { config } from '../config/index.js';

export class StorageService {
  private bucket = config.supabaseStorageBucket;

  async uploadFile(
    file: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<{ url: string; path: string }> {
    const timestamp = Date.now();
    const extension = filename.split('.').pop();
    const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '-');
    const path = `${timestamp}-${cleanName}.${extension}`;

    const { data, error } = await supabaseAdmin.storage
      .from(this.bucket)
      .upload(path, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getPublicUrl(path: string): Promise<string> {
    const { data } = supabaseAdmin.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}

export const storageService = new StorageService();
