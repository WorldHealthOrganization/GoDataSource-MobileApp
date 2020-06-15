import appConfig from './../../app.config';

class DatabaseController {

    constructor(databaseName, databasePassword) {
        this.databaseName = databaseName.replace(/\/|\.|\:/g, '');
        switch (appConfig.env) {
            case 'development':
                this.databasePassword = 'test';
                break;
            default:
                this.databasePassword = databasePassword.replace(/\/|\.|\:/g, '');
                break;

        }
    }

    getDatabaseName () {
        return this.databaseName;
    }

    getDatabasePassword () {
        return this.databasePassword;
    }
}

export default DatabaseController;