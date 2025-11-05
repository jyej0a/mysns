/**
 * @file lib/error-handler.ts
 * @description 에러 처리 유틸리티 함수
 *
 * API 에러와 네트워크 에러를 일관되게 처리하고,
 * 사용자 친화적인 에러 메시지를 제공합니다.
 */

/**
 * 네트워크 에러인지 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  if (error instanceof Error && error.message.includes('network')) {
    return true;
  }
  return false;
}

/**
 * HTTP 상태 코드에 따른 사용자 친화적 에러 메시지 생성
 */
export function getErrorMessage(error: unknown, status?: number): string {
  // 네트워크 에러
  if (isNetworkError(error)) {
    return "네트워크 연결을 확인해주세요. 인터넷 연결 상태를 확인하고 다시 시도해주세요.";
  }

  // HTTP 상태 코드 기반 에러 메시지
  if (status) {
    switch (status) {
      case 400:
        return "잘못된 요청입니다. 입력한 정보를 확인해주세요.";
      case 401:
        return "로그인이 필요합니다. 다시 로그인해주세요.";
      case 403:
        return "권한이 없습니다. 이 작업을 수행할 권한이 없습니다.";
      case 404:
        return "요청한 내용을 찾을 수 없습니다.";
      case 409:
        return "이미 처리된 요청입니다.";
      case 413:
        return "파일 크기가 너무 큽니다. 5MB 이하의 파일을 선택해주세요.";
      case 429:
        return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
      case 500:
      case 502:
      case 503:
        return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      default:
        if (status >= 500) {
          return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
        if (status >= 400) {
          return "요청을 처리할 수 없습니다. 입력한 정보를 확인해주세요.";
        }
    }
  }

  // Error 객체인 경우
  if (error instanceof Error) {
    // 이미 사용자 친화적인 메시지인 경우 그대로 반환
    const message = error.message;
    if (
      message.includes("네트워크") ||
      message.includes("서버") ||
      message.includes("로그인") ||
      message.includes("권한") ||
      message.includes("파일 크기")
    ) {
      return message;
    }
    
    // 기술적인 에러 메시지인 경우 일반적인 메시지로 변환
    if (message.includes("fetch") || message.includes("network")) {
      return "네트워크 연결을 확인해주세요.";
    }
    if (message.includes("JSON") || message.includes("parse")) {
      return "서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.";
    }
    
    return message;
  }

  // 알 수 없는 에러
  return "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

/**
 * API 응답에서 에러 메시지 추출
 */
export async function extractApiError(response: Response): Promise<{
  message: string;
  status: number;
  details?: unknown;
}> {
  const status = response.status;
  let errorMessage = getErrorMessage(null, status);
  let details: unknown = undefined;

  try {
    const contentType = response.headers.get("content-type");
    console.log("[extractApiError] Content-Type:", contentType);
    console.log("[extractApiError] Status:", status);
    
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      console.log("[extractApiError] Parsed JSON:", data);
      
      if (data.error) {
        // data.error가 문자열인 경우
        if (typeof data.error === "string") {
          errorMessage = data.error;
        } else {
          errorMessage = getErrorMessage(new Error(String(data.error)), status);
        }
      } else if (data.message) {
        // error 대신 message 필드가 있는 경우
        errorMessage = data.message;
      }
      details = data;
    } else {
      const text = await response.text();
      console.log("[extractApiError] Parsed Text:", text);
      
      if (text) {
        errorMessage = getErrorMessage(new Error(text), status);
        details = text;
      }
    }
  } catch (parseError) {
    // JSON 파싱 실패 시 기본 메시지 사용
    console.error("[extractApiError] Failed to parse error response:", parseError);
    console.error("[extractApiError] Response status:", status);
    
    // 응답 본문을 다시 읽을 수 없으므로, 상태 코드 기반 메시지 사용
    errorMessage = getErrorMessage(null, status);
  }

  console.log("[extractApiError] Final error:", {
    message: errorMessage,
    status,
    hasDetails: !!details,
  });

  return {
    message: errorMessage,
    status,
    details,
  };
}

/**
 * 에러를 안전하게 처리하는 래퍼 함수
 */
export async function handleApiRequest<T>(
  request: () => Promise<Response>,
  options?: {
    onError?: (error: { message: string; status: number; details?: unknown }) => void;
    onSuccess?: (data: T) => void;
  }
): Promise<T | null> {
  try {
    const response = await request();
    
    if (!response.ok) {
      const error = await extractApiError(response);
      options?.onError?.(error);
      return null;
    }

    const data = await response.json();
    options?.onSuccess?.(data);
    return data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const status = error instanceof Response ? error.status : 0;
    
    options?.onError?.({
      message: errorMessage,
      status,
      details: error,
    });
    
    return null;
  }
}

