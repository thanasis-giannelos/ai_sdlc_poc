import React from 'react';
interface Props {
    label: string;
    onClick?: () => void;
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}
export declare const PrimaryButton: React.FC<Props>;
export {};
