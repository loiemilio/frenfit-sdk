export default {
  frenfitAddress: process.env.FRENFIT_ADDRESS || 'https://www.frenf.it',
  earlyAdoptersPath: process.env.FRENFIT_EARLY_ADOPTER !== '0' ? 'earlyadopters/' : '',
  apiPath: process.env.FRENFIT_API_PATH || 'api/1.1/',

  temporaryFolder: process.env.TEMP_FOLDER || './.temp',
};
