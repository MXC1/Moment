export class User {

    public postIds: string[];
    public friendIds: string[];

    constructor(public id: string,
                public username: string,
                public email: string,
                public image: string,
                public fullName: string,
                public bio: string) {
        this.postIds = [''];
        this.friendIds = [''];
    }
}
