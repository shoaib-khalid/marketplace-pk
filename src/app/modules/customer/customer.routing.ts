import { Route } from '@angular/router';

export const customerRoutes: Route[] = [
    // Customer routes

    {
        path       : '',
        // canActivate: [WithStoreIdGuard],
        // canActivateChild: [WithStoreIdGuard],
        children   : [
            {path: 'orders', loadChildren: () => import('app/modules/customer/orders/orders.module').then(m => m.OrdersModule)},
            {path: 'vouchers', loadChildren: () => import('app/modules/customer/vouchers/vouchers.module').then(m => m.VouchersModule)},
            {path: 'profile', loadChildren: () => import('app/modules/customer/user-profile/user-profile.module').then(m => m.UserProfileModule)},
        ]
    }
]; 
