import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
interface Props {
    label: string;
    type?: string;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
    id?: string;
    autoComplete?: string;
    registration?: UseFormRegisterReturn;
}
export declare const FormInput: React.FC<Props>;
export {};
