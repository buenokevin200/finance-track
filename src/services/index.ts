import { accountsService } from './accounts.service';
import { transactionsService } from './transactions.service';
import { categoriesService } from './categories.service';
import { currenciesService } from './currencies.service';
import { recurrencesService } from './recurrences.service';
import { dashboardService } from './dashboard.service';

export * from './types';
export * from './accounts.service';
export * from './transactions.service';
export * from './categories.service';
export * from './currencies.service';
export * from './recurrences.service';
export * from './dashboard.service';

// Combined object for backward compatibility
export const fireflyService = {
    ...accountsService,
    ...transactionsService,
    ...categoriesService,
    ...currenciesService,
    ...recurrencesService,
    ...dashboardService
};
