import { Injectable } from "@angular/core";
import { Graph} from 'graphlib';

@Injectable() 
export class DiagramState {
    graph: Graph;
}