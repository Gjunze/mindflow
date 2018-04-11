import { Component, ViewChild, Output, EventEmitter, OnInit ,Inject} from '@angular/core';
import { UserService } from '../../_services';
import { TreeComponent } from 'angular-tree-component'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HomeState } from '../../state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Config } from '../../state/config';
@Component({
    selector:'tvModal',
    templateUrl:'./tvmodal.component.html',
    styleUrls: ['./tvmodal.component.scss']
})
export class TvModalComponent implements OnInit  {
    constructor(private user:UserService,
        private homeState: HomeState,
        private dialogRef: MatDialogRef<TvModalComponent>,
        private snackBar: MatSnackBar,
        private config: Config,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    @ViewChild('tree') tree:TreeComponent;
    ngOnInit () {
        this.toMoveId = this.data.docId;
        //this.tree.treeModel.clearFilter();
        this.updateNodes(this.homeState.docs);
        this.excludeDir(this.nodes, this.toMoveId)
    }
    
    toMoveId;

    excludeDir(nodes, dirId, should?) {
      nodes && nodes.forEach(n => {
        if(should) {
          this.tree.treeModel.setIsHidden(n, n)
          this.excludeDir(n.children, dirId, true)
          
        } else {
          if(n.id === this.toMoveId) {
            this.tree.treeModel.setIsHidden(n, n)
            this.excludeDir(n.children, dirId, true)
          } else 
          this.excludeDir(n.children, dirId)
        }
      })
    }
    /*
    nodes = [
        {
        id: 1,
        name: 'root1',
        children: [
            { id: 2, name: 'child1' },
            { id: 3, name: 'child2' }
        ]
        },
        {
        id: 4,
        name: 'root2',
        children: [
            { id: 5, name: 'child2.1' },
            {
            id: 6,
            name: 'child2.2',
            children: [
                { id: 7, name: 'subsub' }
            ]
            }
        ]
        } 
    ];
    */
    nodes = [];
    updateNodes(docs) {
        //let nodes = _.filter(docs, d=>!d['parent']);
        let nodeMap = {};
        let nodes = [];
        function addNode(d) {
            let pid = d['parent'];
            let nid = d['id'];
            let n;
            if(nid in nodeMap)
                n = nodeMap[nid];
            else
                n = nodeMap[nid] = {
                    id:nid,
                    children:[],
                }
            n['name'] = d['title'];
            if(pid) {
                if(pid in nodeMap)
                    nodeMap[pid]['children'].push(n)
            } else
                nodes.push(n);
        }
        docs && docs.forEach(d=> {
            if(d['type'] !== 'folder')
                return;
            addNode(d);
        })
        console.log('nodes', nodes)
        this.nodes = nodes;
    }
    moveToId;
    updateFocus(event) {
        this.moveToId = event.node.id;
    }
    confirm() {  
        console.log('moveto id', this.toMoveId,   this.moveToId);
        this.user.moveDoc(this.toMoveId, this.moveToId).subscribe(
            d=>{
                this.snackBar.open("move succ", "", this.config.snackBarConfig);

            },
            e=>this.snackBar.open("move fail", "", this.config.snackBarConfig)
        );
        this.close();
    }
    close() {
        this.dialogRef.close();
    }
};