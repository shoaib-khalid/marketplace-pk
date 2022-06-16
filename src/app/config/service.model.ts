export interface IAppConfig {
    env: {
        name                : string;
    };
    apiServer: {
        flowBuilderService  : string;
        userService         : string;
        productService      : string;
        orderService        : string;
        reportService       : string;
        deliveryService     : string;
        paymentService      : string;
        locationService     : string;
        analyticService     : string;

    };
    storeFrontDomain        : string;
    marketplaceDomain       : string,
    merchantPortalDomain    : string,
    logging                 : number;
}