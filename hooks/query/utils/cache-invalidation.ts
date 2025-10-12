import { QueryClient } from "@tanstack/react-query";

export const invalidateUserDataCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["userSettings"] });
  queryClient.invalidateQueries({ queryKey: ["session"] });

  queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === "session" ||
      query.queryKey[0] === "userSettings" ||
      query.queryKey.includes("auth") ||
      query.queryKey.includes("user"),
  });

  queryClient.refetchQueries({ queryKey: ["session"] });
};

export const invalidateAuthCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["session"] });
  queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey.includes("auth") || query.queryKey.includes("session"),
  });
  queryClient.refetchQueries({ queryKey: ["session"] });
};

export const invalidateUserProfileCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["userSettings"] });
  queryClient.invalidateQueries({ queryKey: ["session"] });
  queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey.includes("user") ||
      query.queryKey.includes("profile") ||
      query.queryKey.includes("image"),
  });
  queryClient.refetchQueries({ queryKey: ["session"] });
  queryClient.refetchQueries({ queryKey: ["userSettings"] });
};
