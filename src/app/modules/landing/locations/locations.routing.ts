import { Route } from '@angular/router';
import { CategoryComponent } from '../categories/category/category.component';
import { LandingLocationsComponent } from './location-list/location-list.component';
import { LocationComponent } from './location/location.component';

export const landingLocationsRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'location-list'
    },
    {
        path     : 'location-list',
        data: {
            headerTitle: 'Locations'
        },
        component: LandingLocationsComponent
    },
    {
        path     : ':location-id',
        children   : [
            {
                path: '',
                data: {
                    headerTitle: 'Category Details'
                },
                component: LocationComponent,
            }
            
        ],
    },
    {
        path     : ':location-id/:category-id',
        children   : [
            {
                path: '',
                data: {
                    headerTitle: 'Category Details'
                },
                component: LocationComponent,
            }
            
        ],
    },
    
];
