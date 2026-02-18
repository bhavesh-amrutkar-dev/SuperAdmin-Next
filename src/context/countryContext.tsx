"use client";

import { createContext, useContext, ReactNode } from "react";
import { CountryApiItem } from "../lib/services/country";

type CountryContextType = {
    countries: CountryApiItem[];
};

const CountryContext = createContext<CountryContextType>({
    countries: [],
});

export const useCountry = () => useContext(CountryContext);

export function CountryProvider({
    children,
    countries,
}: {
    children: ReactNode;
    countries: CountryApiItem[];
}) {
    return (
        <CountryContext.Provider value={{ countries }}>
            {children}
        </CountryContext.Provider>
    );
}
