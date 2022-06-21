import { Route } from '@angular/router';
import { BuyerCheckoutComponent } from './checkout.component';
import { AddressResolver, CartsResolver, CustomerAddressResolver } from './checkout.resolver';

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
                    address: CustomerAddressResolver,
                    cartsResolver: CartsResolver,
                },
                component: BuyerCheckoutComponent
            },
            // {
            //     path: ':addresses',
            //     data: {
            //         headerTitle: 'Address Setting'
            //     },
            //     resolve  : {
            //         address: CustomerAddressResolver,
            //     },
            //     component: AddressSettingComponent
            // }
        ]
    }
];
