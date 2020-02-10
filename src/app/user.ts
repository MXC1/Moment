export class User {
    constructor(public id: string,
                public username: string,
                public email: string,
                public image: string,
                public fullName: string,
                public bio: string,
                public postIds: string[],
                public friendIds: string[]) {}
}
