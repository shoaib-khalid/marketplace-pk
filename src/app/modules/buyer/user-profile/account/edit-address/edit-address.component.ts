import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'app/core/user/user.service';


@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.component.html',
})
export class EditAddressComponent implements OnInit {

  addressId: string ="";

  addressForm: FormGroup;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    public dialogRef: MatDialogRef<EditAddressComponent>,


  ) { }

  ngOnInit(): void {

    // Create the form
    this.addressForm = this._formBuilder.group({
      name    : ['', Validators.required],
      email   : ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      customerId: ['', Validators.required],
      id: ['', Validators.required],
      isDefault: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      postCode: ['', Validators.required],
      state: ['', Validators.required]
    });

    if(this.data ==='create'){
      this.addressForm.get('isDefault').setValue(false);

    }
    else{
      this.addressForm.patchValue(this.data);

    }
    
  }

  updateAddress(){

    this.dialogRef.close(this.addressForm.value);
  }

  closeDialog(){
    this.dialogRef.close();
  }

}
