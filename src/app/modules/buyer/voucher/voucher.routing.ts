import { Route } from '@angular/router';
import { VoucherListComponent } from './voucher-list/voucher-list.component';


export const voucherRoutes: Route[] = [
    {
        path     : 'voucher-list',
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
                component: VoucherListComponent,
            }
        ],
    }

]; 
