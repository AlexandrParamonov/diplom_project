import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

function AdminRoute() {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <section className="admin-access section">
        <div className="container">
          <p>Проверка прав доступа...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (user.role !== 'admin') {
    return (
      <section className="admin-access section">
        <div className="container admin-access__container">
          <h1>Недостаточно прав</h1>
          <p>
            Административная панель доступна только
            пользователям с ролью admin.
          </p>
        </div>
      </section>
    );
  }

  return <Outlet />;
}

export default AdminRoute;
