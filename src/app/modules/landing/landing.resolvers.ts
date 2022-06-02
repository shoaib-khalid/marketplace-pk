import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { UserService } from 'app/core/user/user.service';
import { PlatformService } from 'app/core/platform/platform.service';
import { JwtService } from 'app/core/jwt/jwt.service';
import { AuthService } from 'app/core/auth/auth.service';
import { CartService } from 'app/core/cart/cart.service';
import { HttpStatService } from 'app/mock-api/httpstat/httpstat.service';
import { switchMap, take, map, tap, catchError, filter } from 'rxjs/operators';
import { StoresService } from 'app/core/store/store.service';
import { LocationService } from 'app/core/location/location.service';

@Injectable({
    providedIn: 'root'
})
export class LandingDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _jwtService: JwtService,
        private _authService: AuthService,
        private _platformsService: PlatformService,
        private _httpstatService: HttpStatService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Use this resolver to resolve initial mock-api for the application
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {        
        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
        ]);
    }
}