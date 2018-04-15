import { Injectable } from '@angular/core'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/concatAll'
import 'rxjs/add/operator/share'
import { List } from 'immutable'
import { IProject } from './project.interface'
import { Sigv4Http } from './sigv4.service'
import * as _keyBy from 'lodash.keyby'
import * as _values from 'lodash.values'
import { Config } from 'ionic-angular'
import { AuthService } from './auth.service'

let userStoreFactory = (sigv4: Sigv4Http, auth: AuthService, config: Config) => { return new UserStore(sigv4, auth, config) }

export let UserStoreProvider = {
  provide: UserStore,
  useFactory: userStoreFactory,
  deps: [Sigv4Http, AuthService]
}

@Injectable()
export class UserStore {


  private endpoint:string;

  constructor (private sigv4: Sigv4Http, private auth: AuthService, private config: Config) {
    this.endpoint = 'https://vrs8bsy3e8.execute-api.us-east-1.amazonaws.com/prod';
  }

  saveCurrentUser () : Observable<any> {
    let idTokenPayload = this.auth.cognitoUser.getSignInUserSession().getIdToken()['decodePayload']();
    let body = {
          "user": {
            "name": "example",
            "birthday": 'example',
            "email": idTokenPayload.email,
            "phone": "example",
            "zip": "example",
            "schoolar": "example",
            "salary": "example",
            "civil-state": "example"
          }
        };

    return  this.auth.getCredentials().map(creds => {
      creds['idToken'] = this.auth.cognitoUser.getSignInUserSession().getIdToken().getJwtToken();
      return creds;
    }).map(creds => this.sigv4.put(this.endpoint, 'userinfo', body,creds)).concatAll().share();
  }
}
