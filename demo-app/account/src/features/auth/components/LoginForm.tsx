import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '../../../shared/lib/zodResolver';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import { useLogin } from '../hooks/useLogin';
import { FormInput } from '../../../shared/components/FormInput';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { LinkButton } from '../../../shared/components/LinkButton';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';

export const LoginForm: React.FC = () => {
  const { mutate, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    mutate(values, {
      onError: (err) => {
        setError('root', {
          message: err instanceof Error ? err.message : 'Login failed. Please try again.',
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5" aria-label="Login form">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-neutral-900">Sign in</h1>
        <p className="text-sm text-neutral-500">Enter your credentials to continue</p>
      </div>

      {errors.root && <ErrorMessage message={errors.root.message ?? 'An error occurred'} />}

      <FormInput
        label="Email"
        type="email"
        id="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        registration={register('email')}
      />

      <div className="flex flex-col gap-2">
        <FormInput
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          registration={register('password')}
        />
        <div className="flex justify-end">
          <LinkButton label="Forgot password?" href="#" />
        </div>
      </div>

      <PrimaryButton
        label={isPending ? 'Signing in…' : 'Sign in'}
        type="submit"
        loading={isPending}
      />
    </form>
  );
};
