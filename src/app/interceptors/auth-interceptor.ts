import {Injectable} from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders, HttpResponse, HttpErrorResponse
} from '@angular/common/http';

import { Observable } from 'rxjs';
import {finalize, tap} from 'rxjs/operators';
import {AuthService} from "../service/auth.service";
import {Router} from "@angular/router";

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token;
    /* refreshToken() calls simultaneously with the original calls. 20180321.
    let jti = jwt_decode(token);
    console.log("is token valid jti, ", jti);
    if (moment().unix() > jti.exp) {   // now > exp, refresh "access token"
      const user = this.injector.get(User);
      user.refreshToken().subscribe( resp => {
        let headers = resp["headers"];
        console.log("AuthInterceptor isTokenValid headers=", headers);
        if (headers.get("authorization")) {
          localStorage.setItem(this.utils.TOKEN, headers.get("authorization"));
          // replace new token
          request = request.clone({
            headers: new HttpHeaders({
              Authorization: headers.get("authorization")
            })
          });
        }
      });
    } else {
      request = request.clone({
        headers: new HttpHeaders({
          Authorization: token
        })
      });
    }
    */
    request = request.clone({
      // headers: request.headers.set('Authorization', 'Bearer ' + token)
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + token
      })
    });
    return next.handle(request)
      .pipe(
        tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // do stuff with response if you want
console.log('hello auth response', event);
            // set headers if refreshed.
//             let headers = event['headers'];
// // console.log("auth-", headers, headers.get("authorization"), headers.get("Authorization"));
//             if (headers.get('authorization')) {
//               localStorage.setItem(this.utils.TOKEN, headers.get("authorization"));
//               if(headers.get('refresh_token')){
//                 localStorage.setItem(this.utils.REFRESH_TOKEN, headers.get("refresh_token"));
//               }
//               console.log("auth-interceptor 2");
//             }

          }
        }, (err: any) => {
          if (err instanceof HttpErrorResponse) {
            console.log('hello auth error', err);
            if (err.status === 401) {
                this.authService.logOut();
            } else if (err.status === 403) {
                this.router.navigate(['/pages/access']);
                return;
            } else if (err.status === 500) {
              // show login

            }
          }
        }),
        // Log when response observable either completes or errors
        finalize(() => {
          // console.log("hello auth finalize");
          // const elapsed = Date.now() - started;
          // const msg = `${req.method} "${req.urlWithParams}"
          //    ${ok} in ${elapsed} ms.`;
          // this.messenger.add(msg);
        })
      );
    /*
      .do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
        console.log("hello auth response", event);
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        console.log("hello auth error", err);
        if (err.status === 401) {
        }
      }
    });
    */
  }
}
