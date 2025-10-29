import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const UserDatacontext = createContext({
  userData: {},
  setUserData: () => {},
});

export const UserDataProvider = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const auth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/verify`, {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          console.log(data);

          setUserData(data);
          navigate('/home');
        } else throw new Error('Unauthorized');
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setUserData(null);
        if (pathname !== '/login' && pathname !== '/signup') navigate('/login');
      }
    };
    auth();
  }, [pathname, navigate]);

  return (
    <UserDatacontext.Provider
      value={{
        userData,
        setUserData,
      }}
    >
      {children}
    </UserDatacontext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserData = () => useContext(UserDatacontext);
