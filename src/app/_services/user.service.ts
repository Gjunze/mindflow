import { Injectable } from '@angular/core';
import { User } from '../_models/index';
import { Socket } from './socket.service';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/finally';

import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class UserService {
    private userSubject:ReplaySubject<User>;
    constructor(private http: HttpClient, 
      private socket:Socket,
      private router:Router,
      private auth: AuthService
    ) {
        this.register().subscribe(()=>{}, error=>console.log('register error', error));
        this.socket.on('connect', ()=>this.online());
        this.socket.on('disconnect', ()=>this.offline());
    }
    private online() {
        if(!this.userId())
            return;
        for(var k in localStorage) {
            if(!k.startsWith('doc:'))
                continue;
            let d  = JSON.parse(localStorage[k]);
            this.saveDoc(d['docId'], d['data'], d['format'], d['updated'])
                .subscribe((ret)=>{
                    localStorage.removeItem(`doc:${ret['id']}`);
                    //this.toastr.info("检查到有未保存文件，已上传");
                }, 
                (error)=>console.log("online save doc error", error));
        }
    }
    private offline() {

    }
    saveUser(user:User) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        //this.http.setToken(user['token']);
        this.auth.token = user['token']
        return user;
    }
    login(email: string, password: string):Observable<any>{
        return this.socket.post('/api/user/login', { email: email, password: password })
        .map((user)=> {
            // login successful if there's a jwt token in the response
            if (user && user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                return this.saveUser(user);
            } else
                throw 'invalid token';
        });
               
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
    }

    create(user:User) {
        console.log("create user", user);
        return this.socket.post('/api/user/register', user);
    }

    token():string {
        let currentUser = this.current();
        if (currentUser && currentUser.token) {
            return currentUser.token;
        } else 
            return null;
    }
    userId():string {
        let currentUser = this.current();
        if(currentUser && currentUser.id){
            return currentUser.id;
        }
        else
            return null;
    }
    register():Observable<any>{
        let token = this.token();
        let userId = this.userId();

        if(token && userId)
        return this.socket.get(`/api/user/${userId}?token=${token}`)
        .map(user=>{
            user.token = token;
            return user;
        })
        .map(user=>this.saveUser(user));
        else
            return Observable.throw('invalid token');
    }
    saveDocLocal(docId, data, format, updated) {
        if(!this.userId())
            return;
        let doc = {type:'doc', data, updated, userId:this.userId(), docId, format};
        localStorage.setItem(`doc:${docId}`, JSON.stringify(doc));
    }
    getDocLocal(docId) {
        let doc = localStorage.getItem(docId);
        try{
            if(doc) 
                return JSON.parse(doc);

        }catch(e) {
            return null;
        }
    }
    
    newDoc(title:string, parent:string, type?:string):Observable<any> {
        let id = this.userId();
        console.log('new doc', this.http);
        return this.http.post(`/api/user/${id}/docs`, {title, parent, type});
    }

    saveDoc(docId:string, data:string, format:string, updated = new Date):Observable<any> {
        let token = this.token();
        if(!this.socket.isConnected()){ 
            this.saveDocLocal(docId, data, format, updated);
            return Observable.throw({error:'no connection'});
        }

        return this.socket.post(`/api/doc/${docId}?token=${token}`, {data:data,format:format, updated});

        //return this.http.post(`/api/doc/${docId}`, {data:data,format:format}, this.jwt()).map(resp=>resp.json());
    }
    importAs({data, format, type, parent}) {
        return this.http.post(`/api/doc/importAs`, {data, type, format, parent})
    }
    fetchDoc(docId:string):Observable<any> {
        let token = this.token();
        return this.socket.get(`/api/doc/${docId}?token=${token}`);
    }
    updateDoc(docId:string, table:string) {
        let id = this.userId();
        return this.http.post(`/api/doc/${docId}`, {table}).map((response: Response) => response.json());
    }
    moveDoc(docId:string, parent:string) {
        let token = this.token();
        //return this.http.post(`/api/doc/${docId}`, {parent},this.jwt()).map((response: Response) => response.json());
        return this.socket.post(`/api/doc/${docId}/parent?token=${token}`, {parent});
    }
    updateDocTitle(docId:string, title:string) {
        let token = this.token();
        return this.socket.post(`/api/doc/${docId}/title?token=${token}`, {title});
    }
    prevStore(docId:string):Observable<any> {
        return this.http.post(`/api/doc/${docId}/back`,{});
    }
    delDoc(docId) {
        let id = this.userId();
        console.log('del doc', docId, id);
        return this.http.delete(`/api/user/${id}/docs/${docId}`);
    }
    current() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }
    copyStore(storeId):Observable<any> {
        let id = this.userId();
        return this.http.post(`/api/user/${id}/copyStore/${storeId}`, {});
    }
    isAdmin():boolean {
        let current = this.current() ;
        return current && (current['role'] === 'admin');
    }
    getAll(){
        let token = this.token();
      //return this.socket.get(`/api/user/?token=${token}`);
      let params = new HttpParams;
      params.set('token', token);
      params.set('limit', "20");
      return this.http.get('/api/user', {params});
    }
	mergeUser(info) {
        let token = this.token();
		return this.http.post(`/api/wx/mergeUser?token=${token}`,info);
	}
}
