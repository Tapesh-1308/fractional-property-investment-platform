export default class BaseRepository {
    constructor({ logger: l = console } = {}) {
        this.logger = l;
    }

    async create(walletData, client) {
        throw new Error('Method not implemented');
    }

    async getUserTransactions(userId) {
        throw new Error('Method not implemented');
    }
};
