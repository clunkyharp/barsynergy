'use client';

import { useEffect, useRef } from 'react';

type PasswordPairValidationProps = {
  confirmName?: string;
  mismatchMessage?: string;
  passwordName?: string;
};

export function PasswordPairValidation({
  confirmName = 'confirmPassword',
  mismatchMessage = 'Пароли не совпадают.',
  passwordName = 'password'
}: PasswordPairValidationProps) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const form = markerRef.current?.closest('form');

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const passwordEl = form.elements.namedItem(passwordName) as HTMLInputElement | null;
    const confirmEl = form.elements.namedItem(confirmName) as HTMLInputElement | null;

    if (!passwordEl || !confirmEl) {
      return;
    }

    const passwordInput = passwordEl;
    const confirmInput = confirmEl;
    let confirmTouched = false;

    function checkMatch() {
      if (!confirmInput.value) {
        confirmInput.setCustomValidity('');
        return;
      }

      confirmInput.setCustomValidity(confirmInput.value !== passwordInput.value ? mismatchMessage : '');
    }

    function onConfirmBlur() {
      confirmTouched = true;
      checkMatch();
    }

    function onConfirmInput() {
      if (confirmTouched) {
        checkMatch();
      }
    }

    function onPasswordInput() {
      if (confirmTouched && confirmInput.value) {
        checkMatch();
      }
    }

    confirmInput.addEventListener('blur', onConfirmBlur);
    confirmInput.addEventListener('input', onConfirmInput);
    passwordInput.addEventListener('input', onPasswordInput);
    form.addEventListener('submit', checkMatch, true);

    return () => {
      confirmInput.removeEventListener('blur', onConfirmBlur);
      confirmInput.removeEventListener('input', onConfirmInput);
      passwordInput.removeEventListener('input', onPasswordInput);
      form.removeEventListener('submit', checkMatch, true);
    };
  }, [confirmName, mismatchMessage, passwordName]);

  return <span aria-hidden="true" hidden ref={markerRef} />;
}
