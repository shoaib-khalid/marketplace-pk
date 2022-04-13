import { Route } from '@angular/router';
import { VoucherListComponent } from './voucher-list/voucher-list.component';
import { VoucherResolver } from './voucher.resolver';


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
                    address: VoucherResolver,
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
