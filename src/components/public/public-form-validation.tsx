'use client';

import { useEffect, useRef } from 'react';

const CONTROL_SELECTOR =
  'input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, select';

type ValidatableControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isValidatableControl(target: EventTarget | null): target is ValidatableControl {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}

function getFieldContainer(control: ValidatableControl) {
  return control.closest('.form-field') ?? control.closest('.checkbox-field') ?? control.closest('.consent-field');
}

function getVisualControl(control: ValidatableControl) {
  if (control.classList.contains('custom-select-native')) {
    return control.closest('.custom-select')?.querySelector<HTMLElement>('.custom-select-trigger') ?? control;
  }

  return control;
}

function getLabelText(control: ValidatableControl) {
  const container = getFieldContainer(control);
  const label = container?.querySelector('label') ?? control.labels?.[0];
  const text = label?.textContent?.replace('*', '').trim();

  return text || 'Поле';
}

function getValidationMessage(control: ValidatableControl) {
  const validity = control.validity;
  const label = getLabelText(control);

  if (validity.valid) {
    return '';
  }

  if (control instanceof HTMLInputElement && control.type === 'checkbox' && validity.valueMissing) {
    return 'Подтвердите согласие, чтобы отправить форму.';
  }

  if (validity.valueMissing) {
    return `${label} нужно заполнить.`;
  }

  if (validity.typeMismatch) {
    if (control instanceof HTMLInputElement && control.type === 'email') {
      return 'Укажите email в формате name@example.com.';
    }

    if (control instanceof HTMLInputElement && control.type === 'url') {
      return 'Укажите ссылку с http:// или https://.';
    }
  }

  if (validity.tooShort && 'minLength' in control && control.minLength > 0) {
    return `Минимум ${control.minLength} символов.`;
  }

  if (validity.tooLong && 'maxLength' in control && control.maxLength > 0) {
    return `Максимум ${control.maxLength} символов.`;
  }

  if (validity.rangeUnderflow && control instanceof HTMLInputElement && control.min) {
    return `Значение должно быть не меньше ${control.min}.`;
  }

  if (validity.rangeOverflow && control instanceof HTMLInputElement && control.max) {
    return `Значение должно быть не больше ${control.max}.`;
  }

  if (validity.patternMismatch) {
    return 'Проверьте формат поля.';
  }

  return 'Проверьте значение поля.';
}

function updateDescribedBy(control: ValidatableControl, errorId: string, hasError: boolean) {
  const current = control.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean) ?? [];
  const next = current.filter((id) => id !== errorId);

  if (hasError) {
    next.push(errorId);
  }

  if (next.length > 0) {
    control.setAttribute('aria-describedby', next.join(' '));
  } else {
    control.removeAttribute('aria-describedby');
  }
}

function setControlError(control: ValidatableControl, shouldShow: boolean) {
  const container = getFieldContainer(control);

  if (!container || !control.willValidate) {
    return;
  }

  const visualControl = getVisualControl(control);
  const errorId = `${control.id || control.name}-validation-error`;
  const message = shouldShow ? getValidationMessage(control) : '';
  let errorElement = Array.from(container.querySelectorAll<HTMLElement>('[data-public-validation-error]')).find(
    (element) => element.id === errorId
  );

  if (!message) {
    errorElement?.remove();
    control.removeAttribute('data-public-validation-active');
    control.removeAttribute('aria-invalid');
    visualControl.removeAttribute('data-public-validation-active');
    visualControl.removeAttribute('aria-invalid');
    if (!container.querySelector('.field-error:not([data-public-validation-error])')) {
      container.removeAttribute('data-state');
      visualControl.removeAttribute('data-state');
    }
    updateDescribedBy(control, errorId, false);
    return;
  }

  if (!errorElement) {
    errorElement = document.createElement('p');
    errorElement.className = 'field-error';
    errorElement.dataset.publicValidationError = 'true';
    errorElement.id = errorId;
    container.appendChild(errorElement);
  }

  errorElement.textContent = message;
  control.dataset.publicValidationActive = 'true';
  control.setAttribute('aria-invalid', 'true');
  visualControl.dataset.publicValidationActive = 'true';
  visualControl.setAttribute('aria-invalid', 'true');
  visualControl.dataset.state = 'error';
  container.setAttribute('data-state', 'error');
  updateDescribedBy(control, errorId, true);
}

function getFormControls(form: HTMLFormElement) {
  return Array.from(form.querySelectorAll<ValidatableControl>(CONTROL_SELECTOR)).filter((control) => control.willValidate);
}

export function PublicFormValidation() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const form = markerRef.current?.closest('form.public-form-shell, form[data-public-validation="true"]');

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const formElement = form;

    function handleBlur(event: FocusEvent) {
      if (!isValidatableControl(event.target)) {
        return;
      }

      setControlError(event.target, !event.target.validity.valid);
    }

    function handleInput(event: Event) {
      if (!isValidatableControl(event.target) || !event.target.dataset.publicValidationActive) {
        return;
      }

      setControlError(event.target, !event.target.validity.valid);
    }

    function validateForm() {
      const controls = getFormControls(formElement);
      const invalidControls = controls.filter((control) => !control.validity.valid);

      if (invalidControls.length === 0) {
        return true;
      }

      invalidControls.forEach((control) => setControlError(control, true));
      getVisualControl(invalidControls[0])?.focus();

      return false;
    }

    function handleInvalid(event: Event) {
      if (!isValidatableControl(event.target)) {
        return;
      }

      const invalidControl = event.target;
      event.preventDefault();
      setControlError(invalidControl, true);

      if (!formElement.dataset.publicValidationFocusing) {
        formElement.dataset.publicValidationFocusing = 'true';
        window.setTimeout(() => {
          getVisualControl(invalidControl).focus();
          delete formElement.dataset.publicValidationFocusing;
        }, 0);
      }
    }

    function handleSubmit(event: SubmitEvent) {
      if (!validateForm()) {
        event.preventDefault();
      }
    }

    function handleSubmitClick(event: MouseEvent) {
      const submitter = event.target instanceof Element ? event.target.closest('button[type="submit"], input[type="submit"]') : null;

      if (submitter && formElement.contains(submitter) && !validateForm()) {
        event.preventDefault();
      }
    }

    function handleSubmitPointerDown(event: PointerEvent) {
      const submitter = event.target instanceof Element ? event.target.closest('button[type="submit"], input[type="submit"]') : null;

      if (submitter && formElement.contains(submitter)) {
        validateForm();
      }
    }

    formElement.addEventListener('blur', handleBlur, true);
    formElement.addEventListener('change', handleInput, true);
    formElement.addEventListener('click', handleSubmitClick, true);
    formElement.addEventListener('input', handleInput, true);
    formElement.addEventListener('invalid', handleInvalid, true);
    formElement.addEventListener('pointerdown', handleSubmitPointerDown, true);
    formElement.addEventListener('submit', handleSubmit);

    return () => {
      formElement.removeEventListener('blur', handleBlur, true);
      formElement.removeEventListener('change', handleInput, true);
      formElement.removeEventListener('click', handleSubmitClick, true);
      formElement.removeEventListener('input', handleInput, true);
      formElement.removeEventListener('invalid', handleInvalid, true);
      formElement.removeEventListener('pointerdown', handleSubmitPointerDown, true);
      formElement.removeEventListener('submit', handleSubmit);
    };
  }, []);

  return <span aria-hidden="true" hidden ref={markerRef} />;
}
