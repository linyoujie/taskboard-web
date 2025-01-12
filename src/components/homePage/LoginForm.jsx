import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { Input, Button, Alert } from '~/components/common';
import styles from '~/styles/components/homePage/LoginForm.module.scss';
import * as validate from '~/utils/validation';

const LoginForm = ({ onValidSubmit, loading: isLoading }, ref) => {
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const [globalAlertMessage, setGlobalAlertMessage] = useState(null);

  const setCustomAlertMessage = useCallback(({ global: globalMessage }) => {
    if (globalMessage !== undefined) setGlobalAlertMessage(globalMessage);
  }, []);

  useImperativeHandle(ref, () => ({ setCustomAlertMessage }), [
    setCustomAlertMessage,
  ]);

  const allFieldsAreValid = useCallback(async () => {
    const inputRefs = [emailInputRef, passwordInputRef];

    const validationResults = await Promise.all(
      inputRefs.map((inputRef) => inputRef.current?.validate()),
    );

    return validationResults.every((result) => result === true);
  }, []);

  const validatePassword = useCallback(async (password) => {
    await validate.requiredPasswordField(password, 8);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const isValidSubmit = await allFieldsAreValid();
      if (!isValidSubmit) return;

      const [email, password] = [emailInputRef, passwordInputRef].map(
        (inputRef) => inputRef.current?.value,
      );

      onValidSubmit?.({ email, password });
    },
    [allFieldsAreValid, onValidSubmit],
  );

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <Input
        ref={emailInputRef}
        name="email"
        type="email"
        label="Email"
        validate={validate.requiredEmailField}
        placeholder="name@host.com"
        required
      />
      <Input
        ref={passwordInputRef}
        name="password"
        type="password"
        label="Password"
        placeholder="********"
        minLength={8}
        validate={validatePassword}
        required
      />

      {globalAlertMessage && (
        <Alert
          className={styles.globalAlertContainer}
          message={globalAlertMessage}
        />
      )}

      <Button type="submit" loading={isLoading}>
        Login
      </Button>
    </form>
  );
};

export default forwardRef(LoginForm);
