import { IsNotEmpty, IsString, IsEmail, Length } from 'class-validator'

export class AuthDto {
    @IsEmail()
    public email: string

    @IsNotEmpty()
    @IsString()
    @Length(8, 20, {message: 'Password has to be between 8 and 20 chars'})
    public password: string
}