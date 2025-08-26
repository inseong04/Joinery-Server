import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({timestamps:true})
export class Notification {
    @Prop()
    userId:string;

    @Prop()
    type:string;

    @Prop()
    message:string;

    @Prop({ type: Object, default:{}})
    meta: Record<string, any>;

    @Prop({ type:Date, default:null, index:true})
    readAt?: Date | null;

    @Prop({type:Boolean, default:false})
    isRead?: boolean | null;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
