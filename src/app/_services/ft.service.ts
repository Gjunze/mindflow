import { Injectable }     from '@angular/core';
var xlsxScript = "http://cdn.bootcss.com/xlsx/0.8.0/xlsx.core.min.js";
import {chain, forEach, map, filter, difference, flatten} from 'lodash'
function getText(graph, id) {
  if(!id) return null;
  let n = graph[id];
  let text = '';
  if("textBlock" in n)
    text = n['textBlock'][0].text;
  else 
    text = n['text'];
  let trimed = text.trim().replace('\n', '').replace('\n', '');
  console.log("trim:", trimed);
  return trimed;
}
const types = ['linker', 'decision', 'terminator', 'process'];

function build(graph) {
  let _graph = {};
  function _add(nid, field, added_id) {
    if(!_graph[nid]) {
      _graph[nid] = {outs:[], ins:[], type:graph[nid].name, text:getText(graph, nid), id:nid};
    }
    _graph[nid][field].push(added_id);
  }
  chain(graph).filter(n=>types.indexOf(n.name) >= 0).forEach(n=> {
    if(n.name === 'linker') {
      let from_id = n.from.id;
      let to_id = n.to.id;
      if(from_id) 
        _add(from_id, 'outs', n.id);
      if(to_id)
        _add(to_id, 'ins', n.id);
      _graph[n.id] = {
        from_id, 
        to_id, 
        type:'linker', 
        text:getText(graph, n.id),
        id:n.id
      };
    }
  });
  return _graph;
}

function parse(graph) {
  let paths:String[][][] = [];
  let _graph = graph;
  let start = filter(_graph, n => n['type'] === 'process' && n['ins'].length === 0)[0];
  let terms = filter(_graph, n => (n['type'] === 'terminator' && n['ins'].length !== 0)|| (n['type'] === 'process' && n['outs'].length === 0));
  forEach(terms, term=>genPath(_graph, start, term, []));

  let texts = map(paths, path=>{
    return map(path, (step)=> {
      return map(step, function(id:any){return _graph[id].text});
    });
  });
  return texts;
  function genPath(graph, start, end, steps) {
    if(start.id === end.id){
      paths.push(steps);
      return;
    }
    for(let link_id of start.outs) {
      let link = graph[link_id];
      let to = graph[link.to_id];
      let new_step = [start.id, link_id, link.to_id];
      //console.log('new_step', new_step);
      /*
      if(_.findIndex(steps, (step)=>_.difference(step, new_step).length === 0) >=0) {
        //console.log('skip', new_step);
        continue;
      }
      */
      let compare_len = 2;
      let skip = false;
      for(let i = 0;i < steps.length - compare_len; i++) {
        let old_steps = [steps[i], steps[i+1]];
        let new_steps = [steps[steps.length - 1], new_step];
        //console.log(old_steps, new_steps, _.difference(old_steps, new_steps));
        if(difference(flatten(old_steps), flatten(new_steps)).length === 0) {
          console.log("found same", new_steps);
          skip = true;
          break;
        }
      }
      if(skip === true)
        continue;
      if(steps.length > 100)
        break;
      genPath(graph, to, end, steps.concat([new_step]));
    }
  }

}
function buildFromGo(linkArray, nodeArray) {
  let graph = {};
  let link_no = 0;
  forEach(nodeArray, (n)=> {
    graph[n['key']] = {
      id:n['key'],
      ins:[],
      outs:[],
      text:n['text'],
      type:"process"
    }
  });
  forEach(linkArray, (l)=> {
    let link_id = link_no++;
    graph[link_id] = {
      from_id:l['from'],
      to_id:l['to'],
      type:'linker',
      id:link_id,
      text:l['text']
    };
    graph[l['from']]['outs'].push(link_id);
    graph[l['to']]['ins'].push(link_id);
  });
  return graph;
}

function buildFromJoint(cells) {
  let typeMap = {
    'fsa.Arrow':'linker',
    'erd.Relationship':'decision',
    'erd.Attribute':'process',
    'fsa.StartState':'terminator',
    'fsa.EndState':'terminator',
    'flowtest.StartState':'terminator',
    'flowtest.EndState':'terminator',
    'flowtest.Process':'process',
    'flowtest.Decision':'decision'
  };
  let graph = {};
  forEach(cells, (c)=> {
    let type = typeMap[c['type']];
    if(!type || type === 'linker') 
      return;
    let text = "";
    try{
      text = c['attrs']['text']['text'];
    }catch(e) {}
    graph[c['id']] = {
      id:c['id'],
      ins:[],
      outs:[],
      text,
      type:'process'
    };
  });
  forEach(cells, (c)=> {
    let text = "";
    let type = typeMap[c['type']];
    if(type !== 'linker')
      return;
    try{ 
      text = c['labels'][0]['attrs']['text']['text'];
    }catch(e) {
    }
    graph[c['id']] = {
      id:c['id'],
      from_id:c['source']['id'],
      to_id:c['target']['id'],
      type:'linker',
      text:text
    };
    graph[c['source']['id']]['outs'].push(c['id']);
    graph[c['target']['id']]['ins'].push(c['id']);
  });
  return graph;
}
function buildFromGL(data) {
  let graph = {};
  data.nodes.forEach(n => {
    let {v, value} = n;
    graph[v] = {
      id: v,
      ins:[],
      outs:[],
      text: value.label,
      type:'process'      
    }
  })
  let linkId = 0;
  data.edges.forEach(e => {
    let {v, w, value} = e;
    graph[linkId] = {
      id: linkId,
      from_id: v,
      to_id: w,
      type: 'linker',
      text:value.label
    }
    graph[v]['outs'].push(linkId);
    graph[w]['ins'].push(linkId);
    linkId++;
  })

  return graph;  
}
declare var XLSX:any;
function _saveXLSData(headArr:string[], dataArr:string[][]):string{
  function datenum(v, date1904?) {
    if(date1904) v+=1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30)).getTime() / (24 * 60 * 60 * 1000));
  }

  function sheet_from_array_of_arrays(data, opts?) {
    var ws = {};
    var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
    for(var R = 0; R != data.length; ++R) {
      for(var C = 0; C != data[R].length; ++C) {
        if(range.s.r > R) range.s.r = R;
        if(range.s.c > C) range.s.c = C;
        if(range.e.r < R) range.e.r = R;
        if(range.e.c < C) range.e.c = C;
        var cell = {v: data[R][C] };
        if(cell.v == null) continue;
        var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
        
        if(typeof cell.v === 'number') cell['t'] = 'n';
        else if(typeof cell.v === 'boolean') cell['t'] = 'b';
        else if(cell.v instanceof Date) {
          cell['t'] = 'n'; cell['z'] = XLSX.SSF._table[14];
          cell.v = datenum(cell.v);
        }
        else cell['t'] = 's';
        
        ws[cell_ref] = cell;
      }
    }
    if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!cols'] = [
      {wch:5},
      {wch:5},
      {wch:30},
      {wch:30},
      {wch:30}];
    return ws;
  }
   
  /* original data */
  //var data = [[1,2,3],[true, false, null, "sheetjs"],["foo","bar",new Date("2014-02-19T14:30Z"), "0.3"], ["baz", null, "qux"]]
  var ws_name = "SheetJS";
   
  function Workbook():void {
    if(!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
  }
   
  dataArr = [headArr].concat(dataArr);
  var wb = new Workbook(), ws = sheet_from_array_of_arrays(dataArr);
   
  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;
  var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});

  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    var b64encoded = btoa(String.fromCharCode.apply(null, view));

    //return buf;
    return b64encoded;
  }
  return s2ab(wbout);
}
@Injectable()
export class FTService {
  public genPath = parse; 

  public build = build;
  public buildFromGo = buildFromGo;
  public buildFromJoint = buildFromJoint;
  public buildFromGL = buildFromGL;
  public saveCSVData(headArr:String[],TheArr:String[][],delim:string):String[] {
    var len = TheArr.length;
    let data = [];
    var tstr1 = '';
    let d:string = delim || ',';
    if(headArr.length>0){
      tstr1 = headArr.join(d);
      data.push(tstr1 + '\n');
    }
    for (var i=0; i<len; i++){
      tstr1 = TheArr[i].join(d);
      data.push(tstr1+"\n");
    }
    //let properties = {type: 'text/csv;charset=utf-8;'};   
    //let file = new File(data, "file.txt", properties);
    return data;

  }
  saveXLSData(headArr:string[], dataArr:string[][]):Promise<any> {
    return new Promise((resolve, reject)=> {
      if(!window['XLSX']) {
        $.getScript(xlsxScript).done(()=> {
          let data = _saveXLSData(headArr, dataArr);
          resolve(data);
        }).fail(error=>reject(error));
      } else {
        resolve(_saveXLSData(headArr, dataArr));
      }
    })
  }
}