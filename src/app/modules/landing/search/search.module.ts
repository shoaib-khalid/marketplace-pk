import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingSearchComponent } from 'app/modules/landing/search/search.component';
import { landingSearchRoutes } from 'app/modules/landing/search/search.routing';
import { MatInputModule } from '@angular/material/input';
import { FuseCardModule } from '@fuse/components/card';
import { BannerModule } from 'app/layout/common/banner/banner.module';
import { SwiperBannerModule } from 'app/layout/common/swiper-banner/swiper-banner.module';

@NgModule({
    declarations: [
        LandingSearchComponent
    ],
    imports     : [
        RouterModule.forChild(landingSearchRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        MatInputModule,
        FuseCardModule,
        BannerModule,
        SwiperBannerModule
    ]
})
export class LandingSearchModule
{
}
