export class User {

    public bio: string;
    public postIds: string[];
    public friendIds: string[];

    constructor(public id: string,
                public username: string,
                public email: string,
                public image: string,
                public fullName: string
    ) { }
}
