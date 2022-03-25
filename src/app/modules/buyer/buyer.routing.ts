import { Route } from '@angular/router';

export const buyerRoutes: Route[] = [
        // buyer routes
        {
            path       : '',
            children   : [
                {path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule)},
            ]
        }
]; 
