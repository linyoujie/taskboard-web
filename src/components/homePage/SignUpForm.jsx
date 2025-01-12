import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as yup from 'yup';

import { Alert, Button, Input } from '~/components/common';
import styles from '~/styles/components/homePage/SignUpForm.module.scss';
import * as validate from '~/utils/validation';

const { ValidationError } = yup;

const SignUpForm = ({ onValidSubmit, loading: isLoading }, ref) => {
  const firstNameInputRef = useRef(null);
  const lastNameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const [globalAlertMessage, setGlobalAlertMessage] = useState(null);

  const setCustomAlertMessage = useCallback(
    ({ global: globalMessage, email: emailMessage }) => {
      if (globalMessage !== undefined) setGlobalAlertMessage(globalMessage);
      if (emailMessage !== undefined)
        emailInputRef.current?.setCustomAlertMessage(emailMessage);
    },
    [],
  );

  useImperativeHandle(ref, () => ({ setCustomAlertMessage }), [
    setCustomAlertMessage,
  ]);

  const validatePassword = useCallback(async (password) => {
    await validate.requiredPasswordField(password, 8);
  }, []);

  const validateConfirmedPassword = useCallback(async (confirmedPassword) => {
    await validate.requiredTextField(confirmedPassword);

    const password = passwordInputRef.current?.value;
    const passwordsDidMatch = password === confirmedPassword;

    if (!passwordsDidMatch) {
      throw new ValidationError('Passwords do not match!');
    }
  }, []);

  const allFieldsAreValid = useCallback(async () => {
    const inputRefs = [
      firstNameInputRef,
      lastNameInputRef,
      emailInputRef,
      passwordInputRef,
      confirmPasswordInputRef,
    ];

    const validationResults = await Promise.all(
      inputRefs.map((inputRef) => inputRef.current?.validate()),
    );

    return validationResults.every((result) => result === true);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const isValidSubmit = await allFieldsAreValid();
      if (!isValidSubmit) return;

      const [firstName, lastName, email, password] = [
        firstNameInputRef,
        lastNameInputRef,
        emailInputRef,
        passwordInputRef,
      ].map((inputRef) => inputRef.current?.value);

      onValidSubmit?.({ firstName, lastName, email, password });
    },
    [allFieldsAreValid, onValidSubmit],
  );

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.twoColumnInputContainer}>
        <Input
          ref={firstNameInputRef}
          type="text"
          name="firstName"
          label="First Name"
          validate={validate.requiredTextField}
          required
        />
        <Input
          ref={lastNameInputRef}
          type="text"
          name="lastName"
          label="Last Name"
          validate={validate.requiredTextField}
          required
        />
      </div>
      <Input
        ref={emailInputRef}
        type="email"
        name="email"
        label="Email"
        placeholder="name@host.com"
        validate={validate.requiredEmailField}
        required
      />
      <div className={styles.twoColumnInputContainer}>
        <Input
          ref={passwordInputRef}
          type="password"
          name="password"
          label="Password"
          placeholder="********"
          minLength={8}
          validate={validatePassword}
          required
        />
        <Input
          ref={confirmPasswordInputRef}
          type="password"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="********"
          minLength={8}
          validate={validateConfirmedPassword}
          required
        />
      </div>

      {globalAlertMessage && (
        <Alert
          className={styles.globalAlertContainer}
          message={globalAlertMessage}
        />
      )}

      <Button type="submit" loading={isLoading}>
        Registrar
      </Button>
    </form>
  );
};

export default forwardRef(SignUpForm);
