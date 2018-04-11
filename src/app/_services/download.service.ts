import { Injectable } from '@angular/core';
import { Headers, RequestOptions, Response } from '@angular/http';
import { UserService } from './user.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DownloadService {
	constructor(private http:HttpClient, private user:UserService) {}
	genFileLink(content, type, base64?, suf?) {
		base64 = !!base64;
		let query =  {data:content, type:type, base64:base64};
		if(suf)
			query['suf'] = suf;
		return this.http.post('/api/download',query);
	}
  	imageData(storeId) {
		//console.log('download image', storeId);
		return this.http.post('/api/download', {storeId:storeId, type:'image/png', req_type:'image'});
	}
	outlineData(storeId) {
		return this.http.post('/api/download', {storeId:storeId, type:'text/plain', req_type:'outline'});
	}
}