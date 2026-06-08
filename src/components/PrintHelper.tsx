"use client";

import { useEffect } from "react";

export const PrintHelper = () => {
    useEffect(() => {
        const handleBeforePrint = () => {
            // Find all textareas
            const textareas = document.querySelectorAll('textarea');
            textareas.forEach((textarea) => {
                // If a helper already exists, update its content and return
                const existingHelper = textarea.nextElementSibling;
                if (existingHelper && existingHelper.classList.contains('print-textarea-helper')) {
                    existingHelper.textContent = textarea.value;
                    return;
                }

                // Create helper div
                const helper = document.createElement('div');
                helper.className = 'print-textarea-helper hidden print:block whitespace-pre-wrap break-words border border-black p-4 text-black text-sm min-h-[40px] bg-white';
                
                // Copy classes from textarea to preserve styling (padding, borders, etc.)
                const originalClasses = textarea.className.split(' ');
                originalClasses.forEach(cls => {
                    if (cls && !cls.startsWith('focus:') && !cls.startsWith('h-') && !cls.startsWith('resize-')) {
                        helper.classList.add(cls);
                    }
                });

                // Set value or empty fallback
                helper.textContent = textarea.value || '';
                
                // Hide original textarea during print
                textarea.classList.add('print:hidden');
                
                // Insert helper in DOM right after the textarea
                textarea.parentNode?.insertBefore(helper, textarea.nextSibling);
            });
        };

        const handleAfterPrint = () => {
            const helpers = document.querySelectorAll('.print-textarea-helper');
            helpers.forEach((helper) => {
                if (helper.previousElementSibling && helper.previousElementSibling.tagName === 'TEXTAREA') {
                    helper.previousElementSibling.classList.remove('print:hidden');
                }
                helper.remove();
            });
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

    return null;
};
