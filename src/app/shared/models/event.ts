export class EventContent {

    constructor(public id: string,
                public name: string,
                public location: string,
                public creatorId: string,
                public postIds: string[],
                public followerIds: string[],
                public headerImage: string,
                public isPrivate: boolean) {
        /**
         * Ensure arrays are instantiated as empty so that they are iterable
         */
        if (!this.postIds) {
            this.postIds = [];
        }
        if (!this.followerIds) {
            this.followerIds = [];
        }
    }
}
