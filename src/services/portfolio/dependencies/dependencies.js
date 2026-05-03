import userDependencies from "../../user/dependencies/dependencies.js";
import investmentDependencies from "../../investments/dependencies/dependencies.js";
import walletDependencies from "../../wallet/dependencies/dependencies.js";
import { PortfolioController } from "../controller/portfolioController.js";
import { PortfolioService } from "../service/portfolioService.js";

class Container {
    static init() {
        const services = {
            portfolioService: new PortfolioService({
                userService: userDependencies.services.userService,
                investmentService: investmentDependencies.services.investmentService,
                walletService: walletDependencies.services.walletService,
            }),
        };

        const controllers = {
            portfolioController: new PortfolioController(services.portfolioService),
        };

        return { services, controllers };
    }
}

const initialized = Container.init();
export { Container };
export default initialized;
