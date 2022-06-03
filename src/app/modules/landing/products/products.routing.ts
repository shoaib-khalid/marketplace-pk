import { Route } from '@angular/router';
import { LandingProductsComponent } from './product-list/product-list.component';
import { StoresResolver } from './products.resolvers';

export const landingProductsRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'product-list'
    },
    {
        path     : 'product-list',
        data: {
            headerTitle: 'All Products'
        },
        // resolve  : {
        //     stores: StoresResolver,
        // },
        component: LandingProductsComponent
    },


];
