import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomerAuthenticate, ValidateOauthRequest } from 'app/core/auth/auth.types';
import { AppConfig } from 'app/config/service.config';
import { UserService } from 'app/core/user/user.service';
import { DOCUMENT } from '@angular/common';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { PlatformService } from 'app/core/platform/platform.service';
import { takeUntil } from 'rxjs/operators';
import { Platform } from 'app/core/platform/platform.types';
import { Subject } from 'rxjs';
import { AppleLoginProvider } from './apple.provider';
// import * as saveAs from 'file-saver';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignInComponent implements OnInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signInForm: FormGroup;
    showAlert: boolean = false;
    
    //to be display the text
    titleText:string ='Sign In';
    descriptionText:string ='Stay signed in with your account to make searching easier';

    //validate Payload
    validateOauthRequest : ValidateOauthRequest;
    countryCode : string = '';


    platform: Platform;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    domain :string ='';

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _activatedRoute: ActivatedRoute,
        private _userService: UserService,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _apiServer: AppConfig,
        private _router: Router,
        private _socialAuthService: SocialAuthService,
        private _platformsService: PlatformService,


    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.signInForm = this._formBuilder.group({
            domain      : [''],
            username    : ['', [Validators.required]],
            password    : ['', Validators.required],
            rememberMe  : ['']
        });

        let domain = this._apiServer.settings.storeFrontDomain;
        this.signInForm.get('domain').patchValue(domain);
        this.domain = domain;

        
        // Subscribe to platform data
        this._platformsService.platform$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((platform: Platform) => {
                this.platform = platform;

                this.countryCode = this.platform.country;

        });

        // We need to check first the location before we proceed to send the payload
        // this.signInForm.disable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void
    {
        // Return if the form is invalid
        if ( this.signInForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value)
            .subscribe(
                (customerAuthenticateResponse: CustomerAuthenticate) => {                    
                    if (customerAuthenticateResponse) {
                        this._userService.get(customerAuthenticateResponse.session.ownerId)
                            .subscribe((response)=>{
                                let user = {
                                    "id": response.id,
                                    "name": response.name,
                                    "username": response.username,
                                    "locked": response.locked,
                                    "deactivated": response.deactivated,
                                    "created": response.created,
                                    "updated": response.updated,
                                    "roleId": response.roleId,
                                    "email": response.email,
                                    "avatar": "assets/images/logo/logo_default_bg.jpg",
                                    "status": "online",
                                    "role": response.roleId
                                };
    
                                this._userService.user = user;
                            });

                            // // Set the redirect url.
                            // // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                            // // to the correct page after a successful sign in. This way, that url can be set via
                            // // routing file and we don't have to touch here.
                            // const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                            
                            // // Navigate to the redirect url
                            // this._router.navigateByUrl(redirectURL);

                            // Navigate to the redirect url
                            this._activatedRoute.queryParams.subscribe(param => {
                                const redirectUrl = param['redirectUrl'];     

                                if (redirectUrl) {
                                    this._document.location.href = redirectUrl;
                                    
                                }
                                else {
                                    this._router.navigateByUrl('/signed-in-redirect');
                                    
                                }
                            })
                    }
                },
                (error) => {

                    // Re-enable the form
                    this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: 'Wrong email or password'
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }

    signInWithGoogle(): void {
        this._socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
            .then(userData => {
                this.validateOauthRequest = new ValidateOauthRequest();
                this.validateOauthRequest.country = this.countryCode;
                this.validateOauthRequest.email = userData.email;
                this.validateOauthRequest.loginType = "GOOGLE";
                this.validateOauthRequest.name = userData.name;
                this.validateOauthRequest.token = userData.idToken;
                this.validateOauthRequest.domain = this.domain;

                
                this._authService.loginOauth(this.validateOauthRequest,'sign-in-comp-google')
                    .subscribe(() => {
                        // const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                        // // Navigate to the redirect url
                        // this._router.navigateByUrl(redirectURL);

                        this._router.navigate(['/orders' ]);
                    },
                    exception => {
                        console.error("An error has occured : ",exception);
                    });
            });
    }
    
    signInWithFB(): void {
        this._socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID)
            .then(userData => {
                this.validateOauthRequest = new ValidateOauthRequest();
                this.validateOauthRequest.country = this.countryCode;
                this.validateOauthRequest.email = userData.email
                this.validateOauthRequest.loginType = "FACEBOOK";
                this.validateOauthRequest.name = userData.name;
                this.validateOauthRequest.token = userData.authToken;
                this.validateOauthRequest.userId = userData.id;
                this.validateOauthRequest.domain = this.domain;

                
                this._authService.loginOauth(this.validateOauthRequest,'sign-in-comp-facebook')
                    .subscribe(() => {                    
                        // const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                        // // Navigate to the redirect url
                        // this._router.navigateByUrl(redirectURL);

                        this._router.navigate(['/orders' ]);
                    },
                    exception => {
                        console.error("An error has occur : ",exception);

                    });
            });
    }

    signInWithApple(): void {
        this._socialAuthService.signIn(AppleLoginProvider.PROVIDER_ID)
            .then(userData => {

            });
    }
}
