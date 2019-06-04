import getCorrespondingRoles from './get_corresponding_roles';
import { HttpError } from '../../../utils/errors';

describe('get corresponding roles', () => {
  test('can build corresponding roles dictionary', async () => {
    const allRoleMappings = { A: {}, B: {} };
    const correspondingRolesDictionary = { A: false, B: true };
    class RolesService {
      static async get(roleName) {
        if (roleName === 'B') return {};
        throw new HttpError('not found', 404);
      }
    }

    await expect(getCorrespondingRoles(allRoleMappings, RolesService))
      .resolves.toEqual(correspondingRolesDictionary);
  });

  test('fail to check corresponding roles due to 500 Internal Server Error', async () => {
    const allRoleMappings = { A: {}, B: {} };
    const Error500 = new HttpError('internal server error', 500);
    class RolesService {
      static async get(roleName) {
        if (roleName === 'B') return {};
        throw Error500;
      }
    }

    await expect(getCorrespondingRoles(allRoleMappings, RolesService))
      .rejects.toEqual(Error500);
  });
});
