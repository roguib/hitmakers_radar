import mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
const environment = require('../config/environment.config');

export class BaseGateway {

    private uri: string;
    private client: any;

    constructor() {
        // TODO: Remove hardcoded string
        this.uri = 'mongodb://mongo:27017';
        console.log(this.uri);
        this.client = new MongoClient(this.uri);
    }

    public mongoClient(): any {
        this.client = new MongoClient(this.uri);
        return this.client;
    }

    public async connect() {
        try {
            await this.client.connect();
        } catch (e) {
            console.error(e);
        }
    }

    public async close() {
        try {
            await this.client.close();
        } catch (e) {
            console.error(e);
        }
    }
}