'use client';

import { Skeleton } from '@/components/ui/skeleton';

const PostSkeleton = () => {
    return (
        <article className="rounded-3xl border border-border/30 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/5 dark:bg-slate-950/50">
            <header className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-3 w-24 rounded-full" />
                </div>
            </header>

            <div className="mt-6 space-y-3">
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-5/6 rounded-full" />
                <Skeleton className="h-3 w-2/3 rounded-full" />
            </div>

            <Skeleton className="mt-5 h-64 w-full rounded-2xl" />

            <footer className="mt-6 grid grid-cols-2 gap-3">
                <Skeleton className="h-10 rounded-full" />
                <Skeleton className="h-10 rounded-full" />
            </footer>
        </article>
    );
};

export default PostSkeleton;
