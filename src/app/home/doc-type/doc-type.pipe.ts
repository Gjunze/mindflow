import { Pipe, PipeTransform } from '@angular/core';

const docTypeName = {
  'flow': '流程图',
  'mind': '脑图',
  'folder': '目录'
};
const docTypeIcon = {
  'flow': 'library_books',
  'mind': 'library_books',
  'folder': 'folder_open'
};
@Pipe({
  name: 'docTypeName'
})
export class DocTypeNamePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(value)
    return docTypeName[value];
  }

}

@Pipe({
  name: 'docTypeIcon'
})
export class DocTypeIconPipe implements PipeTransform {
  transform(value: any): any {
    if(value)
    return docTypeIcon[value];
  }
}
