import { Route } from '@angular/router';
import { LandingLocationsComponent } from './locations.component';

export const landingLocationsRoutes: Route[] = [
    {
        path     : '',
        data: {
            headerTitle: 'Locations'
        },
        component: LandingLocationsComponent
    }
    
];
