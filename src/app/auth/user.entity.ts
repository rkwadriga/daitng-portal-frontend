export class User {
    constructor(
        public id: string,
        public email: string,
        public firstName?: string,
        public lastName?: string,
        public avatar?: string,
        public gender?: string,
        public age?: number
    ) {}

    get fullName(): string {
        let name = '';

        if (this.firstName !== undefined) {
            name += this.firstName;
        }
        if (this.lastName !== undefined) {
            if (this.firstName !== undefined) {
                name += ' ';
            }
            name += this.lastName;
        }

        return name;
    }

    get fullNameAndEmail(): string {
        const fullName = this.fullName;
        return fullName.length > 0 ? `${fullName} (${this.email})` : this.email;
    }
}