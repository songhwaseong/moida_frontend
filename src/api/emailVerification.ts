import customAxios from './axiosInstance';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errorCode?: string;
}

export const sendEmailCode = async (email: string) => {
    await customAxios.post<ApiResponse<null>>('/auth/email/send-code', { email });
};

export const verifyEmailCode = async (email: string, code: string) => {
    await customAxios.post<ApiResponse<null>>('/auth/email/verify-code', { email, code });
};

export const resetPassword = async (email: string, newPassword: string) => {
    await customAxios.post<ApiResponse<null>>('/auth/email/reset-password', { email, newPassword });
};