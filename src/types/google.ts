// Google credential response type from @react-oauth/google
export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
  clientId?: string;
  // ...other fields if needed
}

// Kết quả login Google trả về accessToken
export interface GoogleLoginResult {
  accessToken: string;
}
// Kết quả signup Google trả về user info
export interface GoogleSignupResult {
  id: string;
  email?: string;
  username?: string;
  birthYear?: number;
  phoneNumber?: string;
  groupId?: string;
}
