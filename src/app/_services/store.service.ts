import { Injectable, EventEmitter } from '@angular/core';
import { Headers, RequestOptions, Response } from '@angular/http';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/do';
@Injectable()
export class StoreService{
	constructor(private http:HttpClient, 
		private user:UserService){}

	update(storeId:string, table:string) {
		return this.http.post('/api/store/' + storeId, {table:table});
	}
	fetch(storeId) {
		return this.http.get(`/api/store/${storeId}`)
			.do(store=> this.events.emit(store));
	}
	public events = new EventEmitter();
}