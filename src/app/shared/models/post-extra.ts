import { User } from './user';
import { EventContent } from './event';

export class PostExtra {
    constructor(public id: string,
        public userId: string,
        public eventId: string,
        public caption: string,
        public content: string,
        public type: 'image' | 'video',
        public comments: { [key: string]: { [key: string]: string } },
        public likers: string[],
        public shares: number,
        public user: User,
        public event: EventContent,
        public hasLiked: boolean,
        public locationName: string,
        public posted: Date
    ) { }
}
