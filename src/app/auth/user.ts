export class User {
    constructor(public id: string, public email: string, private token: string, private tokenExpiraton: Date) { }

    get getToken() {
        if (!this.tokenExpiraton || this.tokenExpiraton <= new Date()) {
            return null;
        } else {
            return this.token;
        }
    }
}
