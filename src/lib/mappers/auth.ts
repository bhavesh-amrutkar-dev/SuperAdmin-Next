import { AuthSession } from "@/src/models/api/response/auth";

export function mapAuthSession(apiData: any): AuthSession {
  return {
    userId: apiData.userId,
    email: apiData.email,
    name: apiData.name,
    profilePic: apiData.profilePic,
    roleType: apiData.roleType,
    isKYCApproved: apiData.isKYCApproved,
    accessToken: apiData.token.accessToken,
    refreshToken: apiData.token.refreshToken,
    accessExpireAt: apiData.token.accessExpireAt,
  };
}
