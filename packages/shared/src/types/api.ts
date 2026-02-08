// API Response wrapper
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Query params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type QueryParams = PaginationParams & SortParams;

// Building API types
export interface CreateBuildingPhotoDto {
  filename: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
  s3Key: string;
  s3Bucket: string;
  thumbnailS3Key?: string;
  caption?: string;
  sortOrder?: number;
  latitude?: number;
  longitude?: number;
  takenAt?: Date;
}

export interface UpdateBuildingPhotoDto {
  caption?: string;
  sortOrder?: number;
}

export interface BuildingPhotoQuery {
  buildingId: string;
  limit?: number; // Default: 3 (max building photos)
  includeDeleted?: boolean;
}
