import React from 'react';

const NavItem = ({ icon: Icon, text, active, onClick }) => (
  <li 
    className={`
      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
      ${active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}
    `}
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span className="text-sm font-medium">{text}</span>
  </li>
);

export default NavItem;