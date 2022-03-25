import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { buyerRoutes } from 'app/modules/buyer/buyer.routing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
    declarations: [
    
    ],
    imports     : [
        RouterModule.forChild(buyerRoutes),
    ],
    bootstrap   : [
    ]
})
export class BuyerModule
{
}
