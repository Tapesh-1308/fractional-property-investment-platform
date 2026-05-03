import { WalletRepository } from "../repository/WalletRepository.js";

import postgres from '../../../shared/config/postgres.js';
import logger from '../../../shared/config/logger.js';
import { WalletService } from "../service/walletService.js";

class Container {
    static init() {
        const repositories = {
            walletRepository: new WalletRepository({ logger, postgres }),
        };

        const services = {
            walletService: new WalletService(repositories),
        };

        return { repositories, services };
    }
}

const initialized = Container.init();
export { Container };
export default initialized;