export class Post {

    public likes: number;
    public commentIds: string[];
    public shares: number;

    constructor(public id: string,
                public userId: string,
                public eventId: string,
                public caption: string,
                public content: string) {
        this.likes = 0;
        this.commentIds = [''];
        this.shares = 0;
    }
}
