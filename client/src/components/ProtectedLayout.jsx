import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

function ProtectedLayout({ onLogout }) {
  const [headerUser, setHeaderUser] = useState();

  const outletContext = useMemo(
    () => ({
      headerUser,
      setHeaderUser,
    }),
    [headerUser]
  );

  return (
    <>
      <Header onLogout={onLogout} currentUser={headerUser} />
      <Outlet context={outletContext} />
    </>
  );
}

export default ProtectedLayout;
