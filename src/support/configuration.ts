export interface Configuration {
  frenfitAddress: string;
  earlyAdoptersPath: string;
  apiPath: string;
}

const env: Record<string, string | undefined> = (typeof process !== 'undefined' && process.env) || {};

const configuration: Configuration = {
  frenfitAddress: env.FRENFIT_ADDRESS || 'https://www.frenf.it',
  earlyAdoptersPath: env.FRENFIT_EARLY_ADOPTER !== '0' ? 'earlyadopters/' : '',
  apiPath: env.FRENFIT_API_PATH || 'api/1.1/',
};

export const configure = (overrides: Partial<Configuration>) => {
  Object.assign(configuration, overrides);
};

export default configuration;
