import { PartialType } from "@nestjs/swagger";
import { SignUpDto } from "src/auth/presentation/dto/signup.dto";

export class UserUpdateDto extends PartialType(SignUpDto){} 