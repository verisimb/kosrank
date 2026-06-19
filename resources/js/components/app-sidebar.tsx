import { Link } from '@inertiajs/react';
import {
    Building2,
    Calculator,
    LayoutGrid,
    SlidersHorizontal,
    Table2,
    Trophy,
} from 'lucide-react';
import AlternativeController from '@/actions/App/Http/Controllers/AlternativeController';
import AlternativeValueController from '@/actions/App/Http/Controllers/AlternativeValueController';
import CalculationController from '@/actions/App/Http/Controllers/CalculationController';
import CriterionController from '@/actions/App/Http/Controllers/CriterionController';
import ResultController from '@/actions/App/Http/Controllers/ResultController';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Kriteria',
        href: CriterionController.index(),
        icon: SlidersHorizontal,
    },
    {
        title: 'Alternatif',
        href: AlternativeController.index(),
        icon: Building2,
    },
    {
        title: 'Nilai Alternatif',
        href: AlternativeValueController.index(),
        icon: Table2,
    },
    {
        title: 'Perhitungan',
        href: CalculationController.index(),
        icon: Calculator,
    },
    {
        title: 'Hasil & Rekomendasi',
        href: ResultController.index(),
        icon: Trophy,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
