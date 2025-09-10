import { UserRecord } from "firebase-admin/lib/auth/user-record";

export interface User extends UserRecord
{
  username?: string;
  accessToken: string,
  phoneNumber: string,
  displayName: string,
  email: string,
  uid: string
}
