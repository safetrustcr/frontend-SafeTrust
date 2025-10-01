import axios from "axios";
import { AxiosError } from "axios";
import { ApiErrorTypes } from "./errors.enum";

export type ErrorResponse = {
  message: string;
  code: number;
  type: ApiErrorTypes;
};

export type WalletError = Pick<ErrorResponse, "message" | "code">;

/**
 * Handle the error
 *
 * @param error - The error
 * @returns The error response
 */
export const handleError = (error: AxiosError | WalletError): ErrorResponse => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const code = axiosError.response?.status || 500;
    const message = axiosError.response?.data?.message || error.message;

    // Map the status code to the error type
    return {
      message,
      code,
      type: mapStatusCodeToErrorType(code),
    };
  } else if (error.code === -4) {
    // Wallet was closed before transaction was sent
    return {
      message: "Wallet was closed before transaction was sent",
      code: -4,
      type: ApiErrorTypes.WALLET_ERROR,
    };
  } else {
    // Unknown error
    return {
      message: error.message,
      code: 500,
      type: ApiErrorTypes.UNKNOWN_ERROR,
    };
  }
};

/**
 * Map the status code to the error type
 *
 * @param code - The status code
 * @returns The error type
 */
const mapStatusCodeToErrorType = (code: number): ApiErrorTypes => {
  switch (code) {
    case 404:
      return ApiErrorTypes.NOT_FOUND;
    case 401:
      return ApiErrorTypes.UNAUTHORIZED;
    default:
      return ApiErrorTypes.UNKNOWN_ERROR;
  }
};
