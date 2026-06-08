/**
 * Safely parses a date string, number, or Date object.
 * If the input is empty or results in an Invalid Date, it returns the current Date.
 */
export const parseSafeDate = (dateVal: any): Date => {
    const fallback = new Date();
    if (!dateVal) return fallback;
    
    try {
        const parsed = new Date(dateVal);
        if (isNaN(parsed.getTime())) {
            return fallback;
        }
        return parsed;
    } catch (e) {
        return fallback;
    }
};
