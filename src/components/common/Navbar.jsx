import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, HelpCircle, Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ toggleSidebar, showMenuButton, currentProduct }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    if (currentProduct === 'home') return 'Welcome to OptiNyxus';
    if (currentProduct === 'pricegenix') return 'PriceGenix AI';
    if (currentProduct === 'marketedge') return 'MarketEdge';
    if (currentProduct === 'optiflow') return 'OptiFlow';
    if (currentProduct === 'engagesync') return 'EngageSync';
    return 'Dashboard';
  };

  return (
    <div className={`fixed top-0 ${showMenuButton ? 'left-0 lg:left-[320px]' : 'left-0'} right-0 h-16 bg-card-bg/95 backdrop-blur-xl border-b border-border-gray z-30`}>
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-hover-gray transition-all"
            >
              <Menu className="w-5 h-5 text-secondary-text" />
            </button>
          )}

          {!showMenuButton && (
            <div className="flex items-center gap-3">
              <img 
                src="/optinyxuslogo.png" 
                alt="OptiNyxus"
                className="h-10 w-auto"
              />
            </div>
          )}

          {showMenuButton && (
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-primary-text tracking-tight">
                {getPageTitle()}
              </h2>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showMenuButton && (
            <div className="relative group hidden md:block">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-text group-focus-within:text-primary-text transition-colors" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2.5 w-64 lg:w-80 bg-hover-gray border border-transparent rounded-xl text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:bg-white focus:border-border-gray focus:shadow-premium-md transition-all"
              />
            </div>
          )}

          {/* Profile Section with Dropdown */}
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-3 border-l border-border-gray cursor-pointer hover:bg-hover-gray px-3 py-2 rounded-xl transition-all"
            >
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"}
                alt={user?.name}
                className="w-10 h-10 rounded-xl object-cover shadow-premium border-2 border-border-gray"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-primary-text">{user?.name || 'Jenny Wilson'}</p>
                <p className="text-xs text-muted-text">{user?.plan || 'Premium'}</p>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card-bg border border-border-gray rounded-xl shadow-premium-xl overflow-hidden">
                <div className="p-4 border-b border-border-gray bg-gradient-card">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"}
                      alt={user?.name}
                      className="w-12 h-12 rounded-xl object-cover shadow-md"
                    />
                    <div>
                      <p className="text-sm font-bold text-primary-text">{user?.name || 'Jenny Wilson'}</p>
                      <p className="text-xs text-muted-text">{user?.email || 'jenny@optinyxus.com'}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        {user?.plan || 'Premium'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Navigate to profile
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-secondary-text hover:bg-hover-gray hover:text-primary-text transition-all text-sm"
                  >
                    <User className="w-4 h-4" strokeWidth={2} />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Navigate to settings
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-secondary-text hover:bg-hover-gray hover:text-primary-text transition-all text-sm"
                  >
                    <Settings className="w-4 h-4" strokeWidth={2} />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Navigate to help
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-secondary-text hover:bg-hover-gray hover:text-primary-text transition-all text-sm"
                  >
                    <HelpCircle className="w-4 h-4" strokeWidth={2} />
                    <span>Help Center</span>
                  </button>
                </div>

                <div className="p-2 border-t border-border-gray">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
