import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bytesize-icon',
  templateUrl: './bytesize-icon.component.html'
})
export class ByteSizeIconComponent {
  @Input() public id: string;
  @Input() public size = 16;
  @Input() public stroke = 3;

  constructor() {
  }
}
