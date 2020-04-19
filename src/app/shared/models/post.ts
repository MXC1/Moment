export class Post {

    constructor(public id: string,
                public userId: string,
                public eventId: string,
                public caption: string,
                public content: string,
                public type: 'image' | 'video',
                public comments: { [key: string]: {[key: string]: string} },
                public likes: number,
                public shares: number) {}
}
