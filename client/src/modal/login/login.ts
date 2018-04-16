import { Component } from '@angular/core'
import { NavController, NavParams, ViewController, Platform } from 'ionic-angular'
import { AuthService } from '../../app/auth.service'
import { EventsService } from '../../app/events.service'
import {Storage} from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';


declare var aws_domain_name:any;
declare var aws_app_client_id : any;
declare var aws_app_client_redirect_uri : any;

@Component({
  selector: 'modal-login',
  templateUrl: 'login.html'
})

export class LoginModal {

  page: string = 'login'
  credentials: Credentials = {}
  message: string
  error: string
  facebook_login_error : boolean

  COGNITO_POOL_URL : string  = aws_domain_name;
  COGNITO_CLIENT_ID : string = aws_app_client_id;
  COGNITO_REDIRECT_URI : string = aws_app_client_redirect_uri;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
    public auth: AuthService,
    public events : EventsService,
    private platform : Platform,
    private storage : Storage,
    private browser : InAppBrowser) {}

  ionViewDidLoad() {
   }

  signin () {
      this.auth.signin(this.credentials).then((user) => {
      this.dismiss()
    }).catch((err) => {
      console.log('error signing in', err)
      this.setError(err.message)
    });
  }

  startFacebookOauth(){
    var login_page = this.browser.create( this.COGNITO_POOL_URL + '/login?response_type=code&client_id=' + this.COGNITO_CLIENT_ID + '&redirect_uri=' + this.COGNITO_REDIRECT_URI);
    login_page.on('loadstop').subscribe(event => {
      if(event.url.startsWith(this.COGNITO_REDIRECT_URI)){
        var auth_code = event.url.split('code=')[1].split('#')[0];
        login_page.close();
        if(auth_code == null)
          this.facebook_login_error = true;
        else
          this.auth.oauthRequestToken(auth_code)
          .subscribe(data => {
              try{
                this.auth.setFacebookSession(data.json());
                this.events.userLoggedId();
                this.dismiss();
              }catch(error){
                this.setError(error.toString());
              }
             }, error => {
              this.setError(error.text());
          });
    }
    });
  }


  register () {
    this.auth.register(this.credentials).then((user) => {
      console.log('register: success', user)
      this.page = 'confirm'
    }).catch((err) => {
      console.log('error registering', err)
      this.setError(err.message)
    })
  }

  confirm () {
    this.auth.confirm(this.credentials).then((user) => {
      this.page = 'login'
      this.setMessage('You have been confirmed. Please sign in.')
    }).catch((err) => {
      console.log('error confirming', err)
      this.setError(err.message)
    })
  }

  private setMessage(msg) {
     this.message = msg
     this.error = null
  }

  private setError(msg) {
     this.error = msg
     this.message = null
  }

  dismiss () { this.viewCtrl.dismiss() }

  reset () { this.error = null; this.message = null; }

  showConfirmation () { this.page = 'confirm' }
}

interface Credentials {
  username?: string
  email?: string
  password?: string
  confcode?: string
}
