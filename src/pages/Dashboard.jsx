import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Home,
  BarChart3,
  Users,
  ChevronDown
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './CSS/Dashboard.css';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Logout Function
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle resizing for mobile/desktop sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Servey List', icon: BarChart3, path: '/surveys' },
    { label: 'Total Clicks', icon: Users, path: '/total-clicks/' },
    { label: 'Completed List', icon: Users, path: '/complete-survey' },
    { label: 'Terminated List', icon: Users, path: '/terminate-survey' },
    { label: 'Quota Full List', icon: Users, path: '/quota-full-survey' },
    { label: 'Redirect Links', icon: Users, path: '/redirect-links' },
    { label: 'Registration', icon: Users, path: '/registrations-all' },
  ];

  return (
    <div className="dashboard">

      {/* Overlay for mobile */}
      {isSidebarOpen && isMobile && (
        <div className="overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'} ${isMobile ? 'mobile' : ''}`}>
        <div className="sidebar-content">

          {/* Header */}
          <div className="sidebar-header">
            {isSidebarOpen && (
              <div className="logo">
                <div className="logo-icon">D</div>
                <h2>Dashboard</h2>
              </div>
            )}
            {!isSidebarOpen && !isMobile && <div className="logo-icon">D</div>}
          </div>

          {/* Navigation */}
          <nav className="nav">
            <ul>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `nav-btn ${isActive ? 'active' : ''} ${!isSidebarOpen ? 'collapsed' : ''}`
                      }
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <Icon className="nav-icon" />
                      {isSidebarOpen && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          {isSidebarOpen && (
            <div className="sidebar-footer">
              <div className="upgrade-banner">
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`main ${isSidebarOpen && !isMobile ? 'expanded' : isMobile ? 'mobile' : 'collapsed'}`}>

        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="header-left">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="menu-btn"
              >
                {isSidebarOpen ? <X /> : <Menu />}
              </button>
              <h1 className="title">Welcome Back!</h1>
            </div>

            {/* User Dropdown */}
            <div className="header-right" ref={dropdownRef}>
              <div
                className="user"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ cursor: "pointer" }}
              >
                <div className="avatar">AD</div>
                <div className="user-info">
                  <p>Admin</p>
                  <p>Panel</p>
                </div>
                <ChevronDown />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <ul>
                    <li onClick={() => window.location.href = "/profile"}>Profile</li>
                    <li onClick={handleLogout}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
