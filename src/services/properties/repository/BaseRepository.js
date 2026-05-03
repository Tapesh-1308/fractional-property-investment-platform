export default class BaseRepository {
    constructor({ logger: l = console } = {}) {
        this.logger = l;
    }

    async create(propertyData) {
        throw new Error('Method not implemented');
    }

    async findById(propertyId) {
        throw new Error('Method not implemented');
    }

    async findByIdForUpdate(propertyId, client) {
        throw new Error('Method not implemented');
    }

    async decrementAvailableSlots(propertyId, slots, client) {
        throw new Error('Method not implemented');
    }

    async incrementAvailableSlots(propertyId, slots, client) {
        throw new Error('Method not implemented');
    }
};
