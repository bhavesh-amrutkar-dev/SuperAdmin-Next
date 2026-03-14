export const getSquareErrorMessage = (err: any, t: any) => {
  let parsedError = err;

  // Parse JSON string errors
  if (typeof err === "string") {
    try {
      parsedError = JSON.parse(err);
    } catch {
      parsedError = { message: err };
    }
  }

  const code =
    parsedError?.error?.code ||
    parsedError?.code ||
    parsedError?.errors?.[0]?.code;

  const message =
    parsedError?.message ||
    parsedError?.error?.detail ||
    JSON.stringify(parsedError);

  const upper = `${code || ""} ${message || ""}`.toUpperCase();

  console.log("Square error normalized:", upper);

  /**
   * Rule based matching
   * Order matters
   */
  const rules = [
    { match: ["GENERIC_DECLINE"], key: "squareGenericDecline" },
    { match: ["CARD_DECLINED"], key: "squareCardDeclined" },
    { match: ["INSUFFICIENT_FUNDS"], key: "squareInsufficientFunds" },
    { match: ["EXPIRED_CARD"], key: "squareExpiredCard" },
    { match: ["CVV_FAILURE"], key: "squareCvvFailure" },
    { match: ["CARD_VELOCITY_EXCEEDED"], key: "squareCardVelocityExceeded" },
    { match: ["INVALID"], key: "squareInvalidDetails" },
    { match: ["NETWORK", "CONNECTION"], key: "squareNetworkError" },
    { match: ["TIMEOUT"], key: "squareTimeout" },
    { match: ["SERVER", "500"], key: "squareServerError" },
    { match: ["UNAUTHORIZED", "401"], key: "squareUnauthorized" },
    { match: ["NOT FOUND", "404"], key: "squareNotFound" },
  ];

  // Rule matcher
  for (const rule of rules) {
    if (rule.match.some((m) => upper.includes(m))) {
      return t(rule.key);
    }
  }

  /**
   * Exact error code fallback
   */
  const errorMap: Record<string, string> = {
    GENERIC_DECLINE: "squareGenericDecline",
    CARD_NOT_SUPPORTED: "squareCardNotSupported",
    ADDRESS_VERIFICATION_FAILURE: "squareAddressVerificationFailure",
    ZIP_CODE_INVALID: "squareZipInvalid",
    PAYMENT_LIMIT_EXCEEDED: "squarePaymentLimitExceeded",
    TRANSACTION_LIMIT_EXCEEDED: "squareTransactionLimitExceeded",
    SUSPECTED_FRAUD: "squareSuspectedFraud",
    VERIFY_CVV: "squareVerifyCvv",
    APPLE_PAY_NOT_SUPPORTED: "squareApplePayNotSupported",
    GOOGLE_PAY_NOT_SUPPORTED: "squareGooglePayNotSupported",
    TEMPORARY_ERROR: "squareTemporaryError",
    INTERNAL_SERVER_ERROR: "squareServerError",
  };

  if (code && errorMap[code]) {
    return t(errorMap[code]);
  }

  console.warn("Unhandled Square error:", parsedError);

  return t("paymentFailed");
};