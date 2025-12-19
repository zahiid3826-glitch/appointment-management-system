import React from 'react';
import { X, Calendar, Clock, Settings, LogOut, Home } from 'lucide-react';
import NavItem from '../common/NavItem';
import { useNavigate } from 'react-router-dom';

const SidebarDoc = ({ isOpen, onClose, activeTab }) => {
const navigate=useNavigate()

  
  return(
  
  <>
    {isOpen && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
    )}
    
    <div className={`
      fixed top-0 left-0 h-screen bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
      w-72 md:w-64
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 md:relative md:min-h-screen
    `}>
      <div className="flex flex-col h-full">
        <div className="shrink-0 p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              <span className="text-blue-600">Health</span>
              <span className="text-green-500">Care</span>
            </h1>
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {[
                { icon: Home, text: 'Dashboard', id: 'dashboard' },
                { icon: Clock, text: 'Your Availability', id: 'availaility' },
                { icon: Clock, text: 'Upcoming Appointments', id: 'upcoming' },
                //{ icon: Calendar, text: 'Calendar', id: 'calendar' },
                //{ icon: History, text: 'Appointment History', id: 'history' },
                // { icon: UserCircle, text: 'My Profile', id: 'profile' }
              ].map(item => (
                <NavItem 
                  key={item.id}
                  icon={item.icon}
                  text={item.text}
                  active={activeTab === item.id}
                  onClick={() => {navigate("/docDashboard/"+ item.id)}}
                />
              ))}
            </ul>
          </nav>

          <div className="shrink-0 p-4 border-t mt-auto">
            <ul className="space-y-2">
              {[
                { icon: Settings, text: 'Settings', id: 'settings' },
                { icon: LogOut, text: 'Logout', id: 'login' }
              ].map(item => (
                <NavItem 
                  key={item.id}
                  icon={item.icon}
                  text={item.text}
                  active={activeTab === item.id}
                  onClick={() => {navigate("/"+item.id)}}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </>
)};

export default SidebarDoc;