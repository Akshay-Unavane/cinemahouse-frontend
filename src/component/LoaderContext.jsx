import React, { createContext, useContext, useState } from "react";
import Loader from "../component/Loader";

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const showLoader = (msg = "Loading...") => {
    setMessage(msg);
    setLoading(true);
  };

  const hideLoader = () => {
    setLoading(false);
    setMessage("");
  };

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
      {/* Global Loader */}
      <Loader visible={loading} message={message} />
    </LoaderContext.Provider>
  );
};
