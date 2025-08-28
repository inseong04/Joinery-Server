import { User } from "src/auth/infrastructure/schema/user.schema";
import { SignUpDto } from "src/auth/presentation/dto/signup.dto";
import { MongoAddToSetOperation, MongoPullOperation, MongoPushOperation, UserArrayFields } from "src/post/application/interfaces/mongo-operators.interface";

export interface UserRepository {
    findById(id:string): Promise<User | null>;
    findByUsername(username:string): Promise<User | null>;
    findByUsernameWithPassword(username: string): Promise<User | null>;
    findByEmail(email:string): Promise<User | null>;
    updateById(id:string, updateData:Partial<User>): Promise<User | null>;
    updatePassword(id: string, password);
    updateToPullFromArray(id: string, pullData : MongoPullOperation<UserArrayFields>): Promise<User | null>;
    updateToAddToArray(id: string, addData: MongoAddToSetOperation<UserArrayFields>): Promise<User | null>;
    updateToPushToArray(id: string, pushData : MongoPushOperation<UserArrayFields>): Promise<User | null>;
    create(userData: SignUpDto): Promise<User>;
    delete(id: string);
}