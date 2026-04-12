export const parseAccountNotes = (notes?: string) => {
    if (!notes) return { closing_day: '', payment_day: '', cleanNotes: '' };
    
    try {
        const lines = notes.split('\n');
        const jsonMatch = lines.find(l => l.trim().startsWith('card_config:'));
        
        if (jsonMatch) {
            const jsonStr = jsonMatch.replace('card_config:', '').trim();
            const config = JSON.parse(jsonStr);
            const cleanNotes = lines.filter(l => l !== jsonMatch).join('\n').trim();
            return {
                closing_day: config.closing_day?.toString() || '',
                payment_day: config.payment_day?.toString() || '',
                cleanNotes
            };
        }
    } catch (e) {
        console.warn('Failed to parse card config from notes', e);
    }
    
    return { closing_day: '', payment_day: '', cleanNotes: notes };
};

export const packAccountNotes = (cleanNotes: string, closingDay: string, paymentDay: string) => {
    if (!closingDay && !paymentDay) return cleanNotes;
    
    const config = {
        closing_day: closingDay || '',
        payment_day: paymentDay || ''
    };
    
    const jsonStr = `card_config: ${JSON.stringify(config)}`;
    if (cleanNotes.trim()) {
        return `${cleanNotes.trim()}\n${jsonStr}`;
    }
    return jsonStr;
};

export const calculateNextCutDate = (closingDayStr: string) => {
    if (!closingDayStr) return null;
    const closingDay = parseInt(closingDayStr, 10);
    if (isNaN(closingDay) || closingDay < 1 || closingDay > 31) return null;

    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Normalize date (avoid 31 drifting into next month automatically)
    let targetMonth = today.getMonth();
    let targetYear = today.getFullYear();
    let maxDaysInThisMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    let computedDay = Math.min(closingDay, maxDaysInThisMonth);
    
    let targetDate = new Date(targetYear, targetMonth, computedDay);
    
    // If today is past the cut date, move to next month
    if (targetDate.getTime() < today.getTime()) {
        targetMonth++;
        if (targetMonth > 11) {
            targetMonth = 0;
            targetYear++;
        }
        maxDaysInThisMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        computedDay = Math.min(closingDay, maxDaysInThisMonth);
        targetDate = new Date(targetYear, targetMonth, computedDay);
    }
    
    return targetDate;
};

export const calculateNextPaymentDate = (paymentDayStr: string, closingDate: Date | null) => {
    if (!paymentDayStr || !closingDate) return null;
    const paymentDay = parseInt(paymentDayStr, 10);
    if (isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) return null;

    let targetMonth = closingDate.getMonth();
    let targetYear = closingDate.getFullYear();
    
    let targetDate = new Date(targetYear, targetMonth, paymentDay);
    
    // El pago siempre es *después* del corte. A veces unos días después dentro del mismo mes
    // Ocurre más a menudo al mes siguiente.
    if (targetDate.getTime() <= closingDate.getTime()) {
        targetMonth++;
        if (targetMonth > 11) {
            targetMonth = 0;
            targetYear++;
        }
        let maxDays = new Date(targetYear, targetMonth + 1, 0).getDate();
        targetDate = new Date(targetYear, targetMonth, Math.min(paymentDay, maxDays));
    }
    
    return targetDate;
};
