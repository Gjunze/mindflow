import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable() 
export class TagService {
  constructor(private http:HttpClient) {}

  create(data) {
    return this.http.post(`/api/vertag`, data);
  }
  delete(tagId)  {
    return this.http.delete(`/api/vertag/${tagId}`);
  }
  find(docId) {
    return this.http.get(`/api/vertag?docId=${docId}`);
  }
}