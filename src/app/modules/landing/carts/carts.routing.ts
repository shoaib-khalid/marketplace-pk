import { Route } from '@angular/router';
import { CustomerAddressResolver } from '../landing.resolvers';
import { CartListComponent } from './carts.component';
import { CartsResolver } from './carts.resolver';

export const voucherRoutes: Route[] = [
    {
        path     : '',
        children   : [
            {
                path: '',
                resolve  : {
                    cartsResolver: CartsResolver,
                    // address: CustomerAddressResolver
                },
                data: {
                    headerTitle: 'My Carts'
                },
                component: CartListComponent,
            }
        ],
    }

]; 
