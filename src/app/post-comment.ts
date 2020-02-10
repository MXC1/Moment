export class PostComment {
    constructor(public id: string,
                public userId: string,
                public postId: string,
                public content: string) {}
}
