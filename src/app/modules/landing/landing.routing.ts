import { Route } from '@angular/router';

export const landingRoutes: Route[] = [
    // Merchant routes

    {
        path       : '',
        // canActivate: [WithStoreIdGuard],
        // canActivateChild: [WithStoreIdGuard],
        children   : [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
            {path: 'categories', loadChildren: () => import('app/modules/landing/categories/categories.module').then(m => m.LandingCategoriesModule)},
            {path: 'locations', loadChildren: () => import('app/modules/landing/locations/locations.module').then(m => m.LandingLocationsModule)},
            {path: 'stores', loadChildren: () => import('app/modules/landing/stores/stores.module').then(m => m.LandingStoresModule)},
        ]
    }
]; 