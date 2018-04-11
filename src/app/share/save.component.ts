import { Injectable, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Injectable()
export class SaveComponent {
    constructor(private route:ActivatedRoute) {
        console.log('this route', this.route);
    }
}