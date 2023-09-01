/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 *
 * A request to invoke a particular Task
 *
 * :param variables: A string to string dictionary of variables as provided by the user at request time, must
 * correspond to the configured variables for the Task.
 *
 */
export type TaskInvocationRequest = {
    variables: Record<string, string>;
    temperature?: number;
};

