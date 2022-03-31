import { Route } from '@angular/router';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { OrderListComponent } from './order-list/order-list.component';

export const buyerRoutes: Route[] = [
    {
        path     : 'order/:order-id',
        data: {
            breadcrumb: ''
        },
        children   : [
            {
                path: '',
                resolve  : {
                    // products: ProductsResolver,
                    // categories: StoreCategoriesResolver
                },
                data: {
                    breadcrumb: ''
                },
                component: OrderDetailsComponent,
            }
        ],
    },
    // buyer routes
    {
        path     : ':progress-slug',
        data: {
            breadcrumb: ''
        },
        children   : [
            {
                path: '',
                resolve  : {
                    // products: ProductsResolver,
                    // categories: StoreCategoriesResolver
                },
                data: {
                    breadcrumb: ''
                },
                component: OrderListComponent,
            }
        ],
        // component: OrderDetailsComponent,
        // resolve  : {
        //     // categories: StoreCategoriesResolver,
        //     // discounts: StoreDiscountsResolver
        // }
    },
    {
        path     : '',
        redirectTo: 'all-progress',
        component: OrderListComponent
    }
]; 
