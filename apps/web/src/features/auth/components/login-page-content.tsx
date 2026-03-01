'use client';

import { useState } from 'react';

import { LoginForm } from './login-form';
import { DemoLoginButtons } from './demo-login-buttons';

export function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <LoginForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
      />
      <DemoLoginButtons
        onSelect={(e, p) => {
          setEmail(e);
          setPassword(p);
        }}
      />
    </>
  );
}
