export class EventContent {

    location: string;
    postIds: string[];
    followerIds: string[];
    headerImage: string;

    constructor(public id: string,
                public name: string,
                public creatorId: string) {
        this.postIds = [];
        this.followerIds = [];
        this.headerImage = 'https://www.dailydot.com/wp-content/uploads/2019/07/netflix-family-reunion-show.jpg';
    }

    setLocation(location: string) {
        this.location = location;
    }
}
