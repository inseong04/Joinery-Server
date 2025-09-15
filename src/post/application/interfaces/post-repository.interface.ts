import { PostSchema } from "src/post/infrastructure/schema/post.schema";
import { PostCreateDto } from "src/post/presentation/dto/post.create.dto";
import { PostGetDto } from "src/post/presentation/dto/post.get.dto";
import { PostInformation } from "./post-information.interface";
import { MongoAddToSetOperation, MongoPullOperation, MongoPushOperation, PostArrayFields } from "./mongo-operators.interface";

export interface PostRepository {
    findById(id:string): Promise<PostSchema | null>;
    findByRegionId(regionId:number): Promise<PostInformation[] | null>;
    findByRegionIdAndFilterDate(regionId:number, startDate:string, endDate:string): Promise<PostInformation[]>;
    findByField(postData: Partial<PostGetDto>): Promise<PostSchema | null>;
    getPopularRegions(): Promise<PostSchema[] | null>;
    create(postData: PostCreateDto): Promise<PostSchema>;
    update(id: string, postUpdateData: Partial<PostGetDto>): Promise<PostSchema | null>;
    updateToPullFromArray(id: string, pullData : MongoPullOperation<PostArrayFields>): Promise<PostSchema | null>;
    updateToAddToArray(id: string, addData: MongoAddToSetOperation<PostArrayFields>): Promise<PostSchema | null>;
    updateToPushToArray(id: string, pushData : MongoPushOperation<PostArrayFields>): Promise<PostSchema | null>;
    updateToAddToArrayAndSet(_id: string, addData: any);
    delete(id: string);
    search(keyword: string);
    
}