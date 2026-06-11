import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

interface PresignRequest {
  files: Array<{
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }>;
}

interface PresignResponse {
  uploads: Array<{
    key: string;
    uploadUrl: string;
    publicUrl: string;
    expiresAt: string;
    headers: Record<string, string>;
  }>;
}

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) return [];

  const request: PresignRequest = {
    files: files.map(file => ({
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    })),
  };

  const presignResponse = await customAxios.post<ApiResponse<PresignResponse>>(
    '/products/images/presign',
    request,
  );
  const { uploads } = unwrap(presignResponse);

  if (uploads.length !== files.length) {
    throw new Error('이미지 업로드 URL 개수가 올바르지 않습니다.');
  }

  await Promise.all(
    uploads.map((upload, index) =>
      fetch(upload.uploadUrl, {
        method: 'PUT',
        headers: upload.headers,
        body: files[index],
      }).then(response => {
        if (!response.ok) {
          throw new Error('이미지 업로드에 실패했습니다.');
        }
      }),
    ),
  );

  return uploads.map(upload => upload.publicUrl);
};
