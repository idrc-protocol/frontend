import { useState } from "react";

import { UserData } from "@/types/pages/onboard.type";

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    investorType: "",
    purchaseAmount: "",
    identityNumber: "",
    phoneNumber: "",
    birthdate: undefined,
    birthplace: "",
    address: "",
    state: "",
    zipCode: "",
    selectedCountry: "",
    otherCitizenships: "",
  });

  const updateUserData = (updates: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...updates }));
  };

  return { userData, updateUserData };
};
