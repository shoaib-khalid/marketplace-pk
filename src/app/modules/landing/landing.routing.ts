import { Route } from '@angular/router';

export const landingRoutes: Route[] = [
    // Merchant routes

    {
        path       : '',
        // canActivate: [WithStoreIdGuard],
        // canActivateChild: [WithStoreIdGuard],
        children   : [
            {path: '', pathMatch : 'full', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
            {path: 'search', loadChildren: () => import('app/modules/landing/search/search.module').then(m => m.LandingSearchModule)},
            {path: 'category', loadChildren: () => import('app/modules/landing/categories/categories.module').then(m => m.CategoriesModule)},
            {path: 'location', loadChildren: () => import('app/modules/landing/locations/locations.module').then(m => m.LandingLocationsModule)},
            {path: 'store', loadChildren: () => import('app/modules/landing/stores/stores.module').then(m => m.LandingStoresModule)},
        ]
    }
]; 