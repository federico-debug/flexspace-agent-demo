/**
 * Shared Retell SDK client (singleton)
 *
 * Imported by each Vercel serverless function so we never
 * duplicate the client instantiation or hard-code the API URL.
 * The underscore prefix tells Vercel this is NOT an endpoint.
 */

import Retell from 'retell-sdk';

const client = new Retell({
  apiKey: process.env.RETELL_API_KEY,
});

export default client;
