"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { CountryApiItem } from "../lib/services/country";
import { getCookie, setCookie } from "cookies-next";

type CountryContextType = {
  countries: CountryApiItem[];
  selectedCountryId: string | null;
  setSelectedCountryId: (id: string) => void;
};

const CountryContext = createContext<CountryContextType>({
  countries: [],
  selectedCountryId: null,
  setSelectedCountryId: () => { },
});

export const useCountry = () => useContext(CountryContext);

export function CountryProvider({
  children,
  countries,
}: {
  children: ReactNode;
  countries: CountryApiItem[];
}) {
  const [selectedCountryId, setSelectedCountryIdState] = useState<string | null>(null);

  useEffect(() => {
    const cookieId = getCookie("C_id");
    if (cookieId) {
      setSelectedCountryIdState(cookieId as string);
    }
  }, []);

  const setSelectedCountryId = (id: string) => {
    setCookie("C_id", id, {
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
    });
    setSelectedCountryIdState(id);
  };

  return (
    <CountryContext.Provider
      value={{ countries, selectedCountryId, setSelectedCountryId }}
    >
      {children}
    </CountryContext.Provider>
  );
}