import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

function ClientRoute() {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <section className="section">
        <div className="container">
          <p>Проверка авторизации...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname
            + location.search,
        }}
      />
    );
  }

  if (user.role !== 'client') {
    return (
      <section className="admin-access section">
        <div className="container admin-access__container">
          <h1>Недостаточно прав</h1>

          <p>
            Раздел бронирований доступен
            пользователям с ролью client.
          </p>
        </div>
      </section>
    );
  }

  return <Outlet />;
}

export default ClientRoute;
