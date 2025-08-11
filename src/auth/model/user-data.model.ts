export class UserDataModel {
    birthdays:Birthdays;
    genders:Genders;
}

interface Birthdays{
    date?: DateObject;
}

interface DateObject{
    year?: number;
    month?: number;
    day?: number;
}

interface Genders{
    value: 'male' | 'female' | 'unspecified' | string;
};