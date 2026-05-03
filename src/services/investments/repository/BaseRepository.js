export default class BaseRepository {
    constructor({ logger: l = console } = {}) {
        this.logger = l;
    }

    async create(investmentData, client) {
        throw new Error('Method not implemented');
    }

    async findByIdForUpdate(investmentId, client) {
        throw new Error('Method not implemented');
    }

    async markWithdrawn(investmentId, client) {
        throw new Error('Method not implemented');
    }

    async getUserInvestments(userId) {
        throw new Error('Method not implemented');
    }
};
