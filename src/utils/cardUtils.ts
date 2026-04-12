import { differenceInDays, isBefore, setDate, addMonths, startOfDay, lastDayOfMonth } from 'date-fns';

/**
 * Parsea las notas buscando el día de corte con el formato [CUTOFF_DAY:XX]
 */
export const parseCutoffDay = (notes?: string) => {
    if (!notes) return { cutoff_day: null, cleanNotes: '' };
    
    // Buscar el nuevo formato de etiqueta
    const match = notes.match(/\[CUTOFF_DAY:(\d+)\]/);
    if (match) {
        const cutoff_day = parseInt(match[1], 10);
        const cleanNotes = notes.replace(match[0], '').trim();
        return { cutoff_day, cleanNotes };
    }
    
    // Fallback para el formato legacy de JSON si aún existe en la base de datos
    try {
        const lines = notes.split('\n');
        const jsonMatch = lines.find(l => l.trim().startsWith('card_config:'));
        if (jsonMatch) {
            const jsonStr = jsonMatch.replace('card_config:', '').trim();
            const config = JSON.parse(jsonStr);
            const cleanNotes = lines.filter(l => l !== jsonMatch).join('\n').trim();
            const day = config.closing_day || config.cutoff_day;
            return {
                cutoff_day: day ? parseInt(day, 10) : null,
                cleanNotes
            };
        }
    } catch (e) {
        // Ignorar errores de parseo
    }
    
    return { cutoff_day: null, cleanNotes: notes };
};

/**
 * Empaqueta el día de corte dentro de las notas usando la etiqueta [CUTOFF_DAY:XX]
 */
export const packCutoffDay = (cleanNotes: string, cutoffDay: string | number) => {
    if (!cutoffDay) return cleanNotes;
    
    // Validar que sea un número entre 1 y 31
    const day = typeof cutoffDay === 'string' ? parseInt(cutoffDay, 10) : cutoffDay;
    if (isNaN(day) || day < 1 || day > 31) return cleanNotes;

    const parsed = parseCutoffDay(cleanNotes);
    const notesWithoutTag = parsed.cleanNotes;
    const tag = `[CUTOFF_DAY:${day}]`;
    
    return notesWithoutTag ? `${notesWithoutTag}\n${tag}` : tag;
};

/**
 * Calcula el estado de la tarjeta, días restantes y periodo de gracia.
 */
export const calculateCardStatus = (cutoffDay: number, monthlyPaymentDateStr?: string | null) => {
    const today = startOfDay(new Date());
    const currentDay = today.getDate();
    
    // Validar día de corte
    const validCutoffDay = Math.min(cutoffDay, lastDayOfMonth(today).getDate());
    
    // Próximo cierre
    let nextCutoff = setDate(today, validCutoffDay);
    if (isBefore(nextCutoff, today)) {
        nextCutoff = addMonths(nextCutoff, 1);
        // Recalcular día de corte para el mes siguiente si fuera necesario (ej. 31 en febrero)
        const maxDayNextMonth = lastDayOfMonth(nextCutoff).getDate();
        if (cutoffDay > maxDayNextMonth) {
            nextCutoff = setDate(nextCutoff, maxDayNextMonth);
        }
    }
    
    const daysUntilCutoff = differenceInDays(nextCutoff, today);

    // Lógica de Periodo de Gracia y Día de Pago
    let payDay = 0;
    let isGracePeriod = false;

    if (monthlyPaymentDateStr) {
        // En Firefly V1, monthly_payment_date suele ser una fecha completa o solo el día
        const payDate = new Date(monthlyPaymentDateStr);
        payDay = isNaN(payDate.getDate()) ? 0 : payDate.getDate();
        
        if (payDay > 0) {
            // Periodo de gracia
            if (cutoffDay < payDay) {
                isGracePeriod = currentDay > cutoffDay && currentDay <= payDay;
            } else {
                isGracePeriod = currentDay > cutoffDay || currentDay <= payDay;
            }
        }
    }

    return {
        nextCutoff,
        daysUntilCutoff,
        isGracePeriod,
        payDay
    };
};

/**
 * Aliases para compatibilidad con código antiguo
 */
export const parseAccountNotes = (notes?: string) => {
    const { cutoff_day, cleanNotes } = parseCutoffDay(notes);
    return {
        is_cc: !!cutoff_day,
        closing_day: cutoff_day?.toString() || '',
        payment_day: '', 
        credit_limit: '', 
        cleanNotes
    };
};

export const calculateNextCutDate = (closingDayStr: string) => {
    const day = parseInt(closingDayStr, 10);
    if (isNaN(day)) return null;
    const today = new Date();
    let nextDate = new Date(today.getFullYear(), today.getMonth(), day);
    if (today.getDate() > day) nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate;
};

export const calculateNextPaymentDate = (paymentDayStr: string, closingDate: Date | null) => {
    const day = parseInt(paymentDayStr, 10);
    if (isNaN(day) || !closingDate) return null;
    let targetMonth = closingDate.getMonth();
    let targetYear = closingDate.getFullYear();
    let targetDate = new Date(targetYear, targetMonth, day);
    if (targetDate.getTime() <= closingDate.getTime()) {
        targetMonth++;
        if (targetMonth > 11) { targetMonth = 0; targetYear++; }
        targetDate = new Date(targetYear, targetMonth, day);
    }
    return targetDate;
};
