import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormUtils } from '@app/utils/form-utils';

@Component({
  selector: 'form-error-label',
  imports: [],
  templateUrl: './form-error-label.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormErrorLabelComponent {

  control = input.required<AbstractControl>();

  get errorMessage() {
    const errors: ValidationErrors = this.control().errors || {};
    return this.control().touched && Object.values(errors).length > 0
      ? FormUtils.getTextError(errors)
      : null;
  }

}
