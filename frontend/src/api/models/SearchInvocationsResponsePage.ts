/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InvocationMeasurementsOut } from './InvocationMeasurementsOut';

/**
 * A page of results from the search_invocations query.
 *
 * `page` contains the results as a page of `InvocationMeasurements` objects, and
 * the page_token is used for paginating through the query result. A page_token
 * of null indicates that there are no more pages.
 */
export type SearchInvocationsResponsePage = {
    page: Array<InvocationMeasurementsOut>;
    page_token: (string | null);
};

