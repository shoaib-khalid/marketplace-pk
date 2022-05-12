import { Route } from '@angular/router';
import { LandingProductDetailsComponent } from './product-details/product-details.component';
import { ProductResolver } from './product-details/product-details.resolver';
import { LandingStoreComponent } from './store/store.component';
import { LandingStoresComponent } from './stores.component';

export const landingStoresRoutes: Route[] = [
    {
        path     : '',
        data: {
            headerTitle: 'All Stores'
        },
        component: LandingStoresComponent
    },
    {
        path     : ':store-slug',
        children   : [
            {
                path: '',
                component: LandingStoreComponent,
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
            {
                path     : '',
                redirectTo: 'all-products',
                component: LandingStoreComponent
            }
        ],
    },

];
