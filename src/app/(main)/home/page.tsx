'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleSettingsClick = () => {
        router.push('/settings');
    };

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'authenticated') {
        return (
            <div>
                <h1>Chào mừng trở lại, {session.user?.name}!</h1>
                <p>Email của bạn: {session.user?.email}</p>

                <button onClick={() => signOut()}>Đăng xuất</button>
                <div></div>
                <button onClick={handleSettingsClick}>Settings</button>
            </div>
        );
    }

    return <p>Bạn chưa đăng nhập.</p>;
}
