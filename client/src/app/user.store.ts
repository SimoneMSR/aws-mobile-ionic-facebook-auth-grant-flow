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
import { CognitoUserAttribute} from "amazon-cognito-identity.js"
import { fromPromise } from 'rxjs/observable/fromPromise';

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
    let that = this;
    let retval = new Promise((resolve, reject) => {
      this.auth.cognitoUser.getUserAttributes(function(error,attributes){
            if(error)
              reject(error);
            else{
                that.auth.getCredentials().subscribe(creds => {
                    let idToken = that.auth.cognitoUser.getSignInUserSession().getIdToken();
                    let name = attributes.filter(x => x.getName() === 'name')[0].getValue() + " " + attributes.filter(x => x.getName() === 'family_name')[0].getValue();
                    let email = attributes.filter(x => x.getName() === 'email')[0].getValue();
                    let body = {
                        "user": {
                          "name": name,
                          "birthday": 'example',
                          "email": email,
                          "phone": "example",
                          "zip": "example",
                          "schoolar": "example",
                          "salary": "example",
                          "civil-state": "example"
                        }
                      };
                    creds['idToken'] = idToken.getJwtToken();
                    that.sigv4.put(that.endpoint, 'userinfo', body,creds).subscribe((response) =>{
                      resolve(response);
                    }, (error) => {
                      reject(error);
                    });
                })
            }
        });
      });
    return fromPromise(retval);
  }
}
