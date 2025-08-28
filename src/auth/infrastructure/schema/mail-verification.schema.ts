import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({timestamps:true})
export class mailVerification {
    @Prop({required:true})
    email:string;

    @Prop({required:true})
    verificationCode:string;
}

export const mailVerificationSchema = SchemaFactory.createForClass(mailVerification);