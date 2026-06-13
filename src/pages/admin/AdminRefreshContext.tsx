import { createContext, useContext, useEffect } from 'react';

/**
 * 현재 화면(관리자 페이지)의 새로고침 동작과 로딩 상태.
 * 공통 헤더의 새로고침 버튼이 이 값을 사용해 "지금 보고 있는 페이지"를 다시 불러온다.
 */
export interface AdminRefreshHandler {
  onRefresh: () => void | Promise<void>;
  loading: boolean;
}

/**
 * 페이지가 자신의 새로고침 핸들러를 헤더에 등록/해제하는 함수.
 * null 을 넘기면 해제(헤더 버튼 숨김)를 의미한다.
 */
export type RegisterAdminRefresh = (handler: AdminRefreshHandler | null) => void;

export const AdminRefreshContext = createContext<RegisterAdminRefresh | null>(null);

/**
 * 리스트 페이지에서 호출한다. 마운트 시 자신의 reload/loading 을 헤더에 등록하고,
 * 언마운트 시 해제한다. loading 이 바뀌면 다시 등록해 헤더 스피너를 최신 상태로 유지한다.
 *
 * 사용 예:
 *   useRegisterAdminRefresh(reload, loading);
 */
export const useRegisterAdminRefresh = (
  onRefresh: () => void | Promise<void>,
  loading: boolean,
): void => {
  const register = useContext(AdminRefreshContext);
  useEffect(() => {
    if (!register) return;
    register({ onRefresh, loading });
    return () => register(null);
  }, [register, onRefresh, loading]);
};
