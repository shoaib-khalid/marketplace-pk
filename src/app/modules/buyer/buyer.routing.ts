import { Route } from '@angular/router';

export const merchantRoutes: Route[] = [
    // Merchant routes

    {
        path       : '',
        // canActivate: [WithStoreIdGuard],
        // canActivateChild: [WithStoreIdGuard],
        children   : [
            {path: 'orders', loadChildren: () => import('app/modules/buyer/orders/orders.module').then(m => m.OrdersModule)},
            {path: 'vouchers', loadChildren: () => import('app/modules/buyer/vouchers/vouchers.module').then(m => m.VouchersModule)},
            {path: 'profile', loadChildren: () => import('app/modules/buyer/user-profile/user-profile.module').then(m => m.UserProfileModule)},
            {path: 'carts', loadChildren: () => import('app/modules/buyer/carts/carts.module').then(m => m.CartsModule)}
        ]
    }
]; 
