import { Route } from '@angular/router';
import { BuyerCheckoutComponent } from './checkout.component';
import { AddressResolver } from './checkout.resolver';

export const BuyerCheckoutRoutes: Route[] = [
    {
        path     : '',
        children   : [
            {
                path: '',
                data: {
                    headerTitle: 'Checkout'
                },
                resolve  : {
                    address: AddressResolver,
                    // categories: StoreCategoriesResolver
                },
                component: BuyerCheckoutComponent
            }
        ]

    }
];
