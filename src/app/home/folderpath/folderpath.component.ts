import { Component, Input, OnChanges, SimpleChanges, OnInit } from "@angular/core";
import find from 'lodash/find'

@Component({
    templateUrl:"./folderpath.component.html",
    styleUrls: ['./folderpath.component.scss'],
    selector:"folder-path",
})
export class FolderPathComponent implements OnChanges {

    paths:{name:string, id:string}[];
    rebuildPaths() {
        //console.log('rebuildPaths', this.curDir, this.docs);
        let paths:{name:string, id:string}[] = [];
        let curDir = this.curDir;
        while(curDir) {
            let doc = find(this.docs, d=>d['id'] === curDir);
            if(!doc) break;
            paths.push({name:doc['title'], id:doc['id']});
            curDir = doc['parent'];
        }
        //paths.push({name:'MindFlow 文档', id:null});
        paths.reverse();
        //console.log('rebuildPaths', paths);
        this.paths = paths;
    }

    getParams(docId) {
        if(!docId)
            return null;
        return {curDir:docId};
    }
    ngOnChanges(changes:SimpleChanges) {
        this.rebuildPaths();
    }
    @Input() curDir;
    @Input() docs;
}
