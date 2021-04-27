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

const LoginForm = ({ onValidSubmit }, ref) => {
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const [globalAlertMessage, setGlobalAlertMessage] = useState(null);

  const setCustomAlertMessage = useCallback(
    ({ global: globalMessage, email: emailMessage }) => {
      if (globalMessage !== undefined) setGlobalAlertMessage(globalMessage);
      if (emailMessage !== undefined)
        emailInputRef.current?.setCustomAlertMessage(emailMessage);
    },
    [],
  );

  const validatePassword = useCallback(async (password) => {
    await validate.requiredPasswordField(password, 8);
  }, []);

  return (
    <form className={styles.container}>
      <Input
        ref={emailInputRef}
        name="email"
        type="email"
        label="Email"
        validate={validate.requiredEmailField}
        placeholder="nome@dominio.com"
        required
      />
      <Input
        ref={passwordInputRef}
        name="password"
        type="password"
        label="Senha"
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

      <Button type="submit">Login</Button>
    </form>
  );
};

export default forwardRef(LoginForm);
