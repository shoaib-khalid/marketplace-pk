import { Route } from '@angular/router';
import { CategoryComponent } from '../categories/category/category.component';
import { LandingLocationsComponent } from './location-list/location-list.component';
import { LocationComponent } from './location/location.component';
import { LocationResolver } from './locations.resolver';

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
        resolve  : {
            location: LocationResolver,
        },
        component: LandingLocationsComponent
    },
    {
        path     : ':location-id',
        children   : [
            {
                path: '',
                data: {
                    headerTitle: 'Location Details'
                },
                resolve  : {
                    location: LocationResolver,
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
                resolve  : {
                    location: LocationResolver,
                },
                component: LocationComponent,
            }
            
        ],
    },
    // {
    //     path      : '**/location-list',
    //     pathMatch : 'full',
    //     redirectTo: 'location-list'
    // },
    
];