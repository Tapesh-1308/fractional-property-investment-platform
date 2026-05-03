export default class BaseRepository {
    constructor({ logger: l = console } = {}) {
        this.logger = l;
    }

    async findById(userId, client) {
        throw new Error('Method not implemented');
    }

    async findByIdForUpdate(userId, client) {
        throw new Error('Method not implemented');
    }

    async incrementBalance(userId, amount, client) {
        throw new Error('Method not implemented');
    }

    async decrementBalance(userId, amount, client) {
        throw new Error('Method not implemented');
    }

    async getPortfolio(userId) {
        throw new Error('Method not implemented');
    }
};
