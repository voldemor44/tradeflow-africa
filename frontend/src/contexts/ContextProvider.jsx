import { createContext, useState, useContext } from "react";
import { useTranslation } from "react-i18next";

const StateContext = createContext({
  userId: null,
  user: null,
  token: null,
  refreshToken: null,
  paginationDefaultSize: null,
  setUserId: () => {},
  setUser: () => {},
  setToken: () => {},
  setRefreshToken: () => {},
  setPaginationDefaultSize: () => {},
});

export const ContextProvider = ({ children }) => {
  const { t, i18n } = useTranslation();

  const [userId, _setUserId] = useState(localStorage.getItem("USER_ID"));
  const [user, setUser] = useState({});
  const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [refreshToken, _setRefreshToken] = useState(
    localStorage.getItem("REFRESH_TOKEN"),
  );
  const [paginationDefaultSize, setPaginationDefaultSize] = useState("");

  const setUserId = (userId) => {
    _setUserId(userId);
    if (userId) {
      localStorage.setItem("USER_ID", userId);
    } else {
      localStorage.removeItem("USER_ID");
    }
  };

  const setToken = (token) => {
    _setToken(token);
    if (token) {
      localStorage.setItem("ACCESS_TOKEN", token);
    } else {
      localStorage.removeItem("ACCESS_TOKEN");
    }
  };

  const setRefreshToken = (refreshToken) => {
    _setRefreshToken(refreshToken);
    if (refreshToken) {
      localStorage.setItem("REFRESH_TOKEN", refreshToken);
    } else {
      localStorage.removeItem("REFRESH_TOKEN");
    }
  };

  return (
    <StateContext.Provider
      value={{
        userId,
        user,
        token,
        refreshToken,
        paginationDefaultSize,
        t,
        i18n,
        setUserId,
        setUser,
        setToken,
        setRefreshToken,
        setPaginationDefaultSize,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
