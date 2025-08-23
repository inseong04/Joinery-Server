export interface UserDataModel {
    birthdays:Birthdays;
    genders:Genders;
    email:string;
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