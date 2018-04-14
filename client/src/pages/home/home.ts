import { Component } from '@angular/core'

import { NavController } from 'ionic-angular'
import { ModalController, ToastController } from 'ionic-angular'

import { LoginModal } from '../../modal/login/login'
import { LogoutModal } from '../../modal/logout/logout'
import { AuthService } from '../../app/auth.service'

import { EventsService } from '../../app/events.service'
import {UserStore} from '../../app/user.store'

import 'rxjs/add/operator/finally';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public next_refresh : string;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public auth: AuthService,
    private events : EventsService,
    private userStore : UserStore,
    private toastCtrl : ToastController) {

      this.events.userLogged.subscribe(() => {
        this.showSessionExpiration();
      });
    }

  ionViewDidLoad() {
    if(this.auth.isUserSignedIn())
      this.showSessionExpiration().subscribe();
  }

  doRefresh (refresher) {
    if ( this.auth.isUserSignedIn() ){
      this.showSessionExpiration().subscribe(() => {
        refresher.complete();
      });
    }
  }

  private showSessionExpiration(){
          let observable = this.auth.getCredentials();
          return observable.map(
             (credentials) => {
               if( credentials )
                 this.next_refresh = credentials.expireTime;
            }
          );
  }

  openModal () {
    let modal = this.modalCtrl.create(this.auth.isUserSignedIn() ? LogoutModal : LoginModal)
    modal.present()
  }

  get userColor ():string {
    return this.auth.isUserSignedIn() ? 'secondary' : 'primary'
  }

  save(){
    this.userStore.saveCurrentUser()
      .subscribe((success) => {

      });
  }

  presentToast(message) {
      let toast = this.toastCtrl.create({
        message: 'message',
        duration: 3000,
        position: 'middle'
      });
      toast.present();
  }
}
