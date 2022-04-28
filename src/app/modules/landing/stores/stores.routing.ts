import { Route } from '@angular/router';
import { LandingStoresComponent } from './stores.component';

export const landingStoresRoutes: Route[] = [
    {
        path     : '',
        data: {
            headerTitle: 'All Stores'
        },
        component: LandingStoresComponent
    }
    
];
