import { Route } from '@angular/router';
import { LandingCategoriesComponent } from './category-list/category-list.component';
import { CategoryComponent } from './category/category.component';

export const landingCategoriesRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'category-list'
    },
    // {
    //     path : 'category-list',
    //     data: {
    //         headerTitle: 'Category List'
    //     },
    //     component: LandingCategoriesComponent
    // },
    {
        path     : 'category-list',
        children   : [
            {
                path : '',
                data: {
                    headerTitle: 'Category List'
                },
                component: LandingCategoriesComponent
            }
        ],
    },
    {
        path     : ':category-id',
        children   : [
            {
                path: '',
                data: {
                    headerTitle: 'Category Details'
                },
                component: CategoryComponent,
            }
        ],
    },
    
];
