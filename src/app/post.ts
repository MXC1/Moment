export class Post {
    // tslint:disable-next-line: max-line-length
    constructor(public id: string, public userId: string, public eventId: string, public caption: string, public content: string, public likes: number, public commentIds: string[], public shares: number) {}
}
