export class EventContent {
    constructor(public id: string,
                public name: string,
                public creatorId: string,
                postIds: string[],
                followerIds: string[]) { }
}
