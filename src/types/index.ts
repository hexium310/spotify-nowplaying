export interface SpotifyNowplayingStorage {
  userName: string;
  isPremium: boolean;
  clientId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class AuthorizationError extends Error {}
export class UnmatchStateError extends Error {}
