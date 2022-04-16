import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { merchantRoutes } from 'app/modules/buyer/buyer.routing';

@NgModule({
    imports     : [
        RouterModule.forChild(merchantRoutes),
    ],
    bootstrap   : [
    ]
})
export class BuyerModule
{
}
