import { InvestmentRepository } from "../repository/InvestmentRepository.js";

import postgres from '../../../shared/config/postgres.js';
import logger from '../../../shared/config/logger.js';
import { InvestmentService } from "../service/investmentService.js";
import { InvestmentController } from "../controller/investmentController.js";
import propertyDependencies from "../../properties/dependencies/dependencies.js";
import userDependencies from "../../user/dependencies/dependencies.js";
import walletDependencies from "../../wallet/dependencies/dependencies.js";

class Container {
    static init() {
        const repositories = {
            investmentRepository: new InvestmentRepository({ logger, postgres }),
        };

        const services = {
            investmentService: new InvestmentService({
                investmentRepository: repositories.investmentRepository,
                propertyService: propertyDependencies.services.propertyService,
                userService: userDependencies.services.userService,
                walletService: walletDependencies.services.walletService,
                postgres,
            }),
        };

        const controllers = {
            investmentController: new InvestmentController(services.investmentService),
        };

        return { repositories, services, controllers };
    }
}

const initialized = Container.init();
export { Container };
export default initialized;
