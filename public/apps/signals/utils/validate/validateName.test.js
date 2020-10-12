import { validateName } from './validateName';
import {
  requiredText,
  problemWithValidationTryAgainText,
  nameAlreadyExistsText,
  validCharsForNameAreText
} from '../i18n/common';

describe('validate_name', () => {
  it('can validate unique name', async () => {
    const Service = {
      get: () => Promise.reject({ statusCode: 404 })
    };

    await expect(
      validateName(Service)('newName')
    ).resolves.toBe(null);
  });

  it('fail to validate empty name', async () => {
    await expect(
      validateName()('')
    ).resolves.toBe(requiredText);
  });

  it('fail to validate if name exists', async () => {
    const Service = {
      get: () => Promise.resolve({ resp: { _id: '123' } })
    };

    const isUpdatingName = 'true';
    await expect(
      validateName(Service, isUpdatingName)('123')
    ).resolves.toBe(nameAlreadyExistsText);
  });

  it('fail to validate because service fails', async () => {
    const Service = {};
    Service.get = jest.fn();
    Service.get.mockReturnValue(
      Promise.reject({ statusCode: 500, message: 'Internal Server Error' })
    );
    await expect(
      validateName(Service)('123')
    ).resolves.toBe(problemWithValidationTryAgainText);
  });

  it('fail to validate name because there are prohibited special chars', async () => {
    const promises = [];

    [
      '±', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '=', '+',
      '{', '}', '[', ']', ';', ':', '\'', '"', '|', '\\', '<', '>', ',',
      '.', '/', '?', '<', '>', '~', '`'
    ].forEach(specialChar => {
      const checkingValidity = expect(
        validateName()(`name${specialChar}`)
      ).resolves.toBe(validCharsForNameAreText);
      promises.push(checkingValidity);
    });

    await Promise.all(promises);
  });
});
