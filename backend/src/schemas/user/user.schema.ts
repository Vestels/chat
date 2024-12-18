import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({required: true, unique: true})
  email: string;

  @Prop({required: true})
  password: string;

  @Prop({default: false})
  online: boolean;

  @Prop({default: null})
  status: string;

  @Prop({default: null})
  profilePicture: string;
}

export const UserSchema = SchemaFactory.createForClass(User);