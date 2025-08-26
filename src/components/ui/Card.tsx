'use client';

import React from 'react';
import clsx from 'clsx';

export interface InfoCardProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    className?: string;
}

export default function InfoCard({ icon, title, description, className }: InfoCardProps) {
    return (
        <div className={clsx('flex flex-col items-center text-center', 'px-6 py-8', className)}>
            {icon && (
                <div className='mb-4 grid place-items-center'>
                    {/* Icon wrapper */}
                    <div className='h-12 w-12'>{icon}</div>
                </div>
            )}

            <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>

            <p className='mt-3 text-sm leading-6 text-gray-600 max-w-[34ch]'>{description}</p>
        </div>
    );
}

