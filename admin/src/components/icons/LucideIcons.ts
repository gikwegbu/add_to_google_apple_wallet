import { defineComponent, h } from 'vue';

const createIcon = (d: string) => defineComponent({
    render() {
        return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
        }, [h('path', { d })]);
    }
});

export const HomeIcon = createIcon('m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z');
export const UsersIcon = createIcon('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2');
export const TicketIcon = createIcon('M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2');
export const SaveIcon = createIcon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8');
export const GiftIcon = createIcon('M20 12V8H4v4');
export const MenuIcon = createIcon('M3 12h18M3 6h18M3 18h18');
export const XIcon = createIcon('M18 6 6 18M6 6l12 12');
export const BellIcon = createIcon('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9');
export const SearchIcon = createIcon('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z');
export const MoreVerticalIcon = createIcon('M12 12h.01M12 18h.01M12 6h.01');
export const Trash2Icon = createIcon('M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2');
export const UserPlusIcon = createIcon('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M20 8v6M23 11h-6');
export const MailIcon = createIcon('rect width="20" height="16" x="2" y="4" rx="2"'); // Approximate
export const AwardIcon = createIcon('M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'); // Approximate
export const ChevronRightIcon = createIcon('m9 18 6-6-6-6');
export const TrendingUpIcon = createIcon('m22 7-8.5 8.5-5-5L2 17');
export const ArrowUpRightIcon = createIcon('M7 7h10v10M7 17 17 7');
export const SettingsIcon = createIcon('M12 12h.01M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z'); // Approximate
export const CalendarIcon = createIcon('rect width="18" height="18" x="3" y="4" rx="2" ry="2"'); // Approximate
export const MapPinIcon = createIcon('M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z');
export const CameraIcon = createIcon('path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"');
export const UserIcon = createIcon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 0 1 0-8 4 4 0 0 1 0 8z');
