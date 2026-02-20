export const getMyIP = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip || "0.0.0.0";
    } catch (error) {
      console.warn("Error fetching IP:", error);
      return "0.0.0.0";
    }
  };