import { Route } from '@angular/router';
import { AddressSettingComponent } from './address-setting/address-setting.component';
import { BuyerCheckoutComponent } from './checkout.component';
import { AddressResolver, CustomerAddressResolver } from './checkout.resolver';

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
                },
                component: BuyerCheckoutComponent
            },
            {
                path: ':addresses',
                data: {
                    headerTitle: 'Address Setting'
                },
                resolve  : {
                    address: CustomerAddressResolver,
                },
                component: AddressSettingComponent
            }
        ]
    }
];
