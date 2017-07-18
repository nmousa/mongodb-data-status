import { Injectable, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable, Subject } from 'rxjs/Rx';
import * as _ from 'lodash';

@Injectable()
export class WebServiceClient {
    private errorsSubject = new Subject<any>();
    public baseURL: string = "../assets"

    constructor(private http: Http) {
    }

    public getResource(resource: string): Observable<any> {
        const response = this.http.get(`${this.baseURL}/${resource}`);
        return this.getResponseBody(response);
    }

    private getResponseBody(obs: Observable<Response>): Observable<any> {
        let self = this;
        let response = obs
            .catch(error => {
                self.errorsSubject.next(error);
                return Observable.throw(error);
            })
            .map(resp => {
                if (resp['_body'])
                    return resp.json();
            }
            )
            .catch(this.parseError);

        return this.actLikeSafePromise(response);
    }

    actLikeSafePromise<T>(obs: Observable<T>): Observable<T> {
        return obs.map(e => _.cloneDeep(e));
    }

    private parseError(err: Response): Observable<{ message: string; detailMessage: string; status: number }> {
        let message = `Received ${err.status} from the server`;
        return Observable.throw({ message: message, status });
    }
}