import { User } from "src/auth/infrastructure/schema/user.schema";

export interface Author extends Pick<User, 'nickname' | 'username' | 'profileImageUrl'> {}