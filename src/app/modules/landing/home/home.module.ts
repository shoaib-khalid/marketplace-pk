import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { LandingHomeComponent } from 'app/modules/landing/home/home.component';
import { landingHomeRoutes } from 'app/modules/landing/home/home.routing';
import { MatInputModule } from '@angular/material/input';
import { FuseCardModule } from '@fuse/components/card';
import { BannerModule } from 'app/layout/common/banner/banner.module';
import { SwiperBannerModule } from 'app/layout/common/swiper-banner/swiper-banner.module';
import { _SearchModule } from 'app/layout/common/_search/search.module';
import { _FeaturedStoresModule } from 'app/layout/common/_featured-stores/featured-stores.module';
import { _FeaturedCategoriesModule } from 'app/layout/common/_featured-categories/featured-categories.module';
import { _FeaturedLocationsModule } from 'app/layout/common/_featured-locations/featured-locations.module';
import { _FeaturedProductsModule } from 'app/layout/common/_featured-products/featured-products.module';
import { PaginationModule } from 'app/layout/common/pagination/pagination.module';

@NgModule({
    declarations: [
        LandingHomeComponent
    ],
    imports     : [
        RouterModule.forChild(landingHomeRoutes),
        MatButtonModule,
        MatIconModule,
        SharedModule,
        MatInputModule,
        FuseCardModule,
        BannerModule,
        _SearchModule,
        _FeaturedStoresModule,
        _FeaturedCategoriesModule,
        _FeaturedLocationsModule,
        _FeaturedProductsModule,
        SwiperBannerModule,
        PaginationModule
    ]
})
export class LandingHomeModule
{
}
