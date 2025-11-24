'use client';
import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { RouteAwareColumns } from '@/components/layout/RouteAwareColumns';
import { LayoutProvider } from '@/context/LayoutContext';
import { Header } from '@/components/layout/Header';

const MainLayout = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname();
    const isChatPage = pathname?.startsWith('/chat');

    return (
        <div className="h-screen flex flex-col bg-background">
            <Header />

            <div className="flex-1 overflow-hidden">
                <LayoutProvider>
                    {isChatPage ? (
                        <div className="h-full mx-auto max-w-7xl p-6 flex flex-col">
                            <div className="flex-1 rounded-lg border bg-background shadow-sm overflow-hidden">
                                {children}
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-7xl px-4 py-6">
                            <RouteAwareColumns>{children}</RouteAwareColumns>
                        </div>
                    )}
                </LayoutProvider>
            </div>
        </div>
    );
};

export default MainLayout;
