import * as yup from 'yup';

const validationMessages = {
  requiredField: 'This is a required field.',
  invalidEmail: 'Please provide a valid email address',
  passwordTooShort: 'Password must have at least 8 characters',
};

export async function requiredTextField(textValue) {
  return yup
    .string()
    .required(validationMessages.requiredField)
    .validate(textValue);
}

export async function requiredPasswordField(passwordValue, minLength) {
  return yup
    .string()
    .required(validationMessages.requiredField)
    .min(minLength, validationMessages.passwordTooShort)
    .validate(passwordValue);
}

export async function requiredEmailField(emailValue) {
  return yup
    .string()
    .email(validationMessages.invalidEmail)
    .required(validationMessages.requiredField)
    .validate(emailValue);
}
