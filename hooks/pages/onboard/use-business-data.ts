import { useState } from "react";

import { BusinessData } from "@/types/pages/onboard.type";

export const useBusinessData = () => {
  const [businessData, setBusinessData] = useState<BusinessData>({
    companyName: "",
    registrationNumber: "",
    businessAddress: "",
    contactPhone: "",
    ubo: "",
    legalRegistrationType: "",
  });

  const updateBusinessData = (updates: Partial<BusinessData>) => {
    setBusinessData((prev) => ({ ...prev, ...updates }));
  };

  return { businessData, updateBusinessData };
};
