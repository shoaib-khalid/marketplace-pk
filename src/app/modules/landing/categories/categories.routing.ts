import { Route } from '@angular/router';
import { LandingCategoriesComponent } from './categories.component';

export const landingCategoriesRoutes: Route[] = [
    {
        path     : '',
        data: {
            headerTitle: 'Categories'
        },
        component: LandingCategoriesComponent
    }
    
];
