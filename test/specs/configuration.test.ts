import { authEndpoints } from '@sdk/auth';
import configuration, { configure } from '@sdk/support/configuration';

const defaults = { ...configuration };

afterEach(() => {
  configure(defaults);
});

test('endpoints follow the configured address', () => {
  configure({ frenfitAddress: 'https://proxy.example.com' });

  expect(authEndpoints.me.toString()).toEqual('https://proxy.example.com/earlyadopters/api/1.1/feedinfo');
});

test('configure keeps settings that are not overridden', () => {
  configure({ apiPath: 'api/2.0/' });

  expect(configuration.frenfitAddress).toEqual(defaults.frenfitAddress);
  expect(authEndpoints.me.toString()).toEqual(`${defaults.frenfitAddress}/earlyadopters/api/2.0/feedinfo`);
});
