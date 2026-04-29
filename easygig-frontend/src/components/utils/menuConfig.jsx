import { LayoutDashboard, Music, Search} from "lucide-react";

const menuConfig = {
    ARTIST: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/events', label: 'I miei Eventi', icon: Music },
        { to: '/profile', label: 'Il mio Profilo', icon: Search },
    ],
}
export default menuConfig;