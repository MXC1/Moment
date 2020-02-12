export class EventContent {

    postIds: string[];
    followerIds: string[];

    constructor(public id: string,
                public name: string,
                public creatorId: string) { }
}
