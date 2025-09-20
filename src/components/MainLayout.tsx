
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function MainLayout({ cartItemCount, user, onCartClick, onAuthClick, onLogout }) {
  return (
    <>
      <Header
        cartItemCount={cartItemCount}
        user={user}
        onCartClick={onCartClick}
        onAuthClick={onAuthClick}
        onLogout={onLogout}
      />
      <Outlet />
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            &copy; {new Date().getFullYear()} VF Clothes Shop™ All rights reserved. Built with care for the planet.
          </p>
        </div>
      </footer>
    </>
  );
}
