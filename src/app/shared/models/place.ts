export class Place {
    constructor(
        public id: string,
        public name: string,
        public googleId: string,
        public image: string,
        public rating: number,
        public type: string,
        public vicinity: string
        ) {}
}
