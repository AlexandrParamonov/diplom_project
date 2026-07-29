import { Route, Routes } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import ClientRoute from './components/ClientRoute';
import Footer from './components/Footer';
import Header from './components/Header';
import AdminLayout from './layouts/AdminLayout';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminLibrariesPage from './pages/admin/AdminLibrariesPage';
import AdminPage from './pages/admin/AdminPage';
import AdminRentalsPage from './pages/admin/AdminRentalsPage';
import BookPage from './pages/BookPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyRentalsPage from './pages/MyRentalsPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <div className="app">
      <Header />

      <main className="site-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ClientRoute />}>
          <Route path="/rentals" element={<MyRentalsPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />} >
              <Route index element={<AdminPage />} />
              <Route path="libraries" element={ <AdminLibrariesPage />} />
              <Route path="books" element={<AdminBooksPage />} />
              <Route path="rentals" element={ <AdminRentalsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;