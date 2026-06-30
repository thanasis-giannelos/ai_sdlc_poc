import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

export function useFormError<T extends FieldValues>(setError: UseFormSetError<T>) {
  return (message: string) => {
    setError('root' as Path<T>, { message });
  };
}
