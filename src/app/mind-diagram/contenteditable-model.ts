import {Directive, 
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnChanges
  } from "@angular/core";
//import {isPropertyUpdated} from "@angular/forms/src/directives/shared";

@Directive({
	selector: '[contenteditableModel]',
	host: {
		'(blur)': 'onBlur()'
	}
})
export class ContenteditableModel implements OnChanges {
	@Input('contenteditableModel') model: any;
	@Output('contenteditableModelChange') update = new EventEmitter();

	private lastViewModel: any;


	constructor(private elRef: ElementRef) {
	}

	ngOnChanges(changes) {
		//if (isPropertyUpdated(changes, this.lastViewModel)) {
			this.lastViewModel = this.model
      this.refreshView()
      console.log('onchange', changes)
		//}
	}

	onBlur() {
		var value = this.elRef.nativeElement.innerText
		this.lastViewModel = value
		this.update.emit(value)
	}

	private refreshView() {
		this.elRef.nativeElement.innerText = this.model
	}
}
