import { Component, Input, Output, OnInit, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FieldComponent),
      multi: true
    }
  ]
})
export class FieldComponent implements OnInit, ControlValueAccessor {
  @Input() public form: any;
  @Input() public id: string;
  @Input() public model: any;
  @Input() public label: string;
  @Input() public required: boolean;
  @Input() public disabled = false;

  public _onChange = (_: any) => { };
  public _onTouched = () => { };

  constructor() { }

  public writeValue(value: any): void {
    this.model = value;
  }

  public registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit(): void {
    console.log(this.form);
  }
}
