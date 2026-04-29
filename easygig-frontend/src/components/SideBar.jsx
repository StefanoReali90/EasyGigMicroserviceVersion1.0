import SidebarItem from './SideBarItem';
import {menuConfig} from './utils/menuConfig';

const SideBar = ({ isOpen, role }) => {
  const currentMenu = menuConfig[role] || [];
  return (
    <nav className="flex flex-col p-4 gap-2">
      {currentMenu.map((item) => (
        <SidebarItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          isOpen={isOpen}
        />
      ))}
    </nav>
  );
};
export default SideBar;