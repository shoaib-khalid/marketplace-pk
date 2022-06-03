import { Route } from '@angular/router';
import { LandingProductDetailsComponent } from './product-details/product-details.component';
import { ProductResolver } from './product-details/product-details.resolver';
import { LandingStoresComponent } from './store-list/store-list.component';
import { LandingStoreComponent } from './store/store.component';
import { StoresResolver } from './stores.resolvers';

export const landingStoresRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'store-list'
    },
    {
        path     : 'store-list',
        data: {
            headerTitle: 'All Stores'
        },
        // resolve  : {
        //     stores: StoresResolver,
        // },
        component: LandingStoresComponent
    },
    {
        path     : ':store-slug',
        children   : [
            {
                path     : '',
                pathMatch : 'full',
                redirectTo: 'all-products',
            },
            {
                path: ':catalogue-slug',
                children: [
                    {
                        path: '',
                        component: LandingStoreComponent,

                    },
                    {
                        path: ':product-slug',
                        component: LandingProductDetailsComponent,
                        resolve  : {
                            product: ProductResolver,
                        },

                    }
                ],
            },
            // {
            //     path: ':product-slug',
            //     resolve  : {
            //         product: ProductResolver,
            //         // categories: StoreCategoriesResolver
            //     },
            //     component: LandingProductDetailsComponent,
            //     data: {
            //         breadcrumb: ''
            //     }
            // },
            
        ],
        resolve  : {
            stores: StoresResolver,
        }
    },

];
