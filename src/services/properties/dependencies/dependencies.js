import { PropertyRepository } from "../repository/PropertyRepository.js";

import postgres from '../../../shared/config/postgres.js';
import logger from '../../../shared/config/logger.js';
import { PropertyService } from "../service/propertyService.js";
import { PropertyController } from "../controller/propertyController.js";

class Container {
    static init() {
        const repositories = {
            propertyRepository: new PropertyRepository({ logger, postgres }),
        };

        const services = {
            propertyService: new PropertyService(repositories)
        };

        const controllers = {
            propertyController: new PropertyController(services.propertyService)
        }

        return { repositories, services, controllers }
    }
}


const initialized = Container.init();
export { Container };
export default initialized;

