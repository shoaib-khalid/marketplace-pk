import { Route } from '@angular/router';
import { CartListComponent } from './cart-list/cart-list.component';
import { CartsResolver } from './carts.resolver';

export const voucherRoutes: Route[] = [
    {
        path     : '',
        children   : [
            {
                path: '',
                resolve  : {
                    cartsResolver: CartsResolver,
                },
                data: {
                    headerTitle: 'My Carts'
                },
                component: CartListComponent,
            }
        ],
    }

]; 
