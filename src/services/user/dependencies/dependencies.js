import { UserController } from "../controller/userController.js";
import { UserService } from "../service/userService.js";
import { UserRepository } from "../repository/UserRepository.js";
import logger from "../../../shared/config/logger.js";
import postgres from "../../../shared/config/postgres.js";
import walletDependencies from "../../wallet/dependencies/dependencies.js";

class Container {
    static init() {
        const repositories = {
            userRepository: new UserRepository({logger, postgres}),
        };

        const services = {
            userService: new UserService({
                userRepository: repositories.userRepository,
                walletService: walletDependencies.services.walletService,
            }),
        };

        const controllers = {
            userController: new UserController(services.userService),
        };

        return {
            repositories,
            services,
            controllers,
        };
    }
}

const initialized = Container.init();
export { Container };
export default initialized;
