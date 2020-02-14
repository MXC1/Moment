export class EventContent {

    constructor(public id: string,
                public name: string,
                public location: string,
                public creatorId: string,
                public postIds: string[],
                public followerIds: string[],
                public headerImage: string) {
        if (!this.postIds) {
            this.postIds = [];
        }
        if (!this.followerIds) {
            this.followerIds = [];
        }
        this.headerImage = 'https://www.dailydot.com/wp-content/uploads/2019/07/netflix-family-reunion-show.jpg';
    }
}
