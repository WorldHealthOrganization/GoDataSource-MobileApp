class DatabaseController {

    constructor(databaseName, databasePassword) {
        this.databaseName = databaseName.replace(/\/|\.|\:/g, '');
        this.databasePassword = databasePassword.replace(/\/|\.|\:/g, ''); // 'test';
    }

    getDatabaseName () {
        return this.databaseName;
    }

    getDatabasePassword () {
        return this.databasePassword;
    }
}

export default DatabaseController;