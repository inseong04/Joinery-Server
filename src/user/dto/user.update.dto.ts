import { PartialType } from "@nestjs/swagger";
import { SignUpDto } from "src/auth/dto/signup.dto";

export class UserUpdateDto extends PartialType(SignUpDto){} 