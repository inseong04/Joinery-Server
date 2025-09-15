import { User } from "src/auth/infrastructure/schema/user.schema";

export interface SearchAuthor extends Pick<User, 'nickname' | 'profileImageUrl'> {}