import { Route } from '@angular/router';
import { BuyerCheckoutComponent } from './checkout.component';
import { AddressResolver } from './checkout.resolver';

export const BuyerCheckoutRoutes: Route[] = [
    {
        path     : '',
        resolve  : {
            address: AddressResolver,
            // categories: StoreCategoriesResolver
        },
        component: BuyerCheckoutComponent
    }
];
