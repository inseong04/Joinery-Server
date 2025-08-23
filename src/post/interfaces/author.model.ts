import { User } from "src/auth/schema/user.schema";

export interface Author extends Pick<User, 'nickname' | 'username' | 'profileImageUrl'> {}