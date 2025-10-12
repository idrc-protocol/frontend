import { getTranslations } from "next-intl/server";

export async function getValidationMessages() {
  const t = await getTranslations("Auth.Validation");

  return {
    login: {
      emailOrUsernameRequired: t("Login.emailOrUsernameRequired"),
      emailOrUsernameMaxLength: t("Login.emailOrUsernameMaxLength"),
      passwordRequired: t("Login.passwordRequired"),
      passwordMaxLength: t("Login.passwordMaxLength"),
    },
    response: {
      accessTokenRequired: t("Response.accessTokenRequired"),
      expirationInteger: t("Response.expirationInteger"),
      expirationPositive: t("Response.expirationPositive"),
      invalidUserId: t("Response.invalidUserId"),
      invalidEmail: t("Response.invalidEmail"),
      usernameMaxLength: t("Response.usernameMaxLength"),
      invalidUserType: t("Response.invalidUserType"),
      invalidBusinessType: t("Response.invalidBusinessType"),
      invalidStatus: t("Response.invalidStatus"),
      invalidCreationDate: t("Response.invalidCreationDate"),
      invalidUpdateDate: t("Response.invalidUpdateDate"),
    },
  };
}

export function getClientValidationMessages(t: (key: string) => string) {
  return {
    login: {
      emailOrUsernameRequired: t(
        "Auth.Validation.Login.emailOrUsernameRequired",
      ),
      emailOrUsernameMaxLength: t(
        "Auth.Validation.Login.emailOrUsernameMaxLength",
      ),
      passwordRequired: t("Auth.Validation.Login.passwordRequired"),
      passwordMaxLength: t("Auth.Validation.Login.passwordMaxLength"),
    },
    response: {
      accessTokenRequired: t("Auth.Validation.Response.accessTokenRequired"),
      expirationInteger: t("Auth.Validation.Response.expirationInteger"),
      expirationPositive: t("Auth.Validation.Response.expirationPositive"),
      invalidUserId: t("Auth.Validation.Response.invalidUserId"),
      invalidEmail: t("Auth.Validation.Response.invalidEmail"),
      usernameMaxLength: t("Auth.Validation.Response.usernameMaxLength"),
      invalidUserType: t("Auth.Validation.Response.invalidUserType"),
      invalidBusinessType: t("Auth.Validation.Response.invalidBusinessType"),
      invalidStatus: t("Auth.Validation.Response.invalidStatus"),
      invalidCreationDate: t("Auth.Validation.Response.invalidCreationDate"),
      invalidUpdateDate: t("Auth.Validation.Response.invalidUpdateDate"),
    },
  };
}
