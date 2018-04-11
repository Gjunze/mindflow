import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class WxService {
	constructor(private http:HttpClient) {}
	getSignature(url:string) {
		let params = new HttpParams();
		params.set('url', url);
		return this.http.get('/api/wx/signature', {params});
	}
}