import { Route } from '@angular/router';
import { CartListComponent } from './cart-list/cart-list.component';

export const voucherRoutes: Route[] = [
    {
        path     : '',
        children   : [
            {
                path: '',
                data: {
                    headerTitle: 'My Carts'
                },
                component: CartListComponent,
            }
        ],
    }

]; 
