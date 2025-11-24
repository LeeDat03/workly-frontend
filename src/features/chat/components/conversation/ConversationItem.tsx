'use client';

import { useState } from 'react';
import { MoreVertical, User, Trash2, Building2 } from 'lucide-react';
import { UserAvatar } from '../ui';
import { ConversationWithUserInfo, ParticipantType } from '../../types';
import { formatConversationTime, formatUnreadCount } from '../../utils';
import { getUserById } from '@/features/chat/services';
import { useChatStore } from '@/features/chat/store';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConversationItemProps {
    conversation: ConversationWithUserInfo;
    currentUserId: string | null;
    onClick: (conversationId: string) => void;
    onDelete: (conversationId: string) => void;
    onViewProfile: (participantId: string, participantType: ParticipantType) => void;
    isActive?: boolean;
}

export function ConversationItem({
    conversation,
    currentUserId,
    onClick,
    onDelete,
    onViewProfile,
    isActive = false,
}: ConversationItemProps) {
    const { otherParticipant, lastMessage, lastMessageAt, unreadCount } = conversation;
    const myUnreadCount = currentUserId ? unreadCount[currentUserId] || 0 : 0;
    const userInfoCache = useChatStore((state) => state.userInfoCache);
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    if (!otherParticipant) return null;

    const otherUserInfo = userInfoCache[otherParticipant.id];

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        onDelete(conversation._id);
        setIsDeleteDialogOpen(false);
    };

    const handleViewProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onViewProfile(otherParticipant.id, otherParticipant.type);
    };

    return (
        <div
            className={`relative flex w-full items-center gap-3 border-b p-4 transition-colors ${
                isActive ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={() => onClick(conversation._id)}
                className="flex flex-1 items-center gap-3"
            >
                {/* Avatar */}
                <UserAvatar
                    avatar={otherUserInfo?.avatar || ''}
                    name={otherUserInfo?.name || ''}
                    size="lg"
                    showOnlineIndicator
                    isOnline={otherParticipant.isOnline}
                />

                {/* Info */}
                <div className="flex-1 overflow-hidden text-left">
                    <div className="flex items-center justify-between">
                        <h3
                            className={`truncate font-medium ${
                                myUnreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-900'
                            }`}
                        >
                            {otherParticipant.name}
                        </h3>
                        {lastMessageAt && (
                            <span className="ml-2 text-xs text-gray-500">
                                {formatConversationTime(lastMessageAt)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <p
                            className={`truncate text-sm ${
                                myUnreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                            }`}
                        >
                            {lastMessage?.content || 'Chưa có tin nhắn'}
                        </p>

                        {myUnreadCount > 0 && (
                            <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-bold text-white">
                                {formatUnreadCount(myUnreadCount)}
                            </span>
                        )}
                    </div>
                </div>
            </button>

            {/* More Options Menu */}
            {(isHovered || isMenuOpen) && (
                <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <PopoverTrigger asChild>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="absolute right-2 top-2 rounded-full p-1.5 hover:bg-gray-200 transition-colors"
                        >
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="end">
                        <div className="flex flex-col">
                            <button
                                onClick={handleViewProfile}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                {otherParticipant.type === ParticipantType.COMPANY ? (
                                    <Building2 className="h-4 w-4" />
                                ) : (
                                    <User className="h-4 w-4" />
                                )}
                                <span>Xem trang cá nhân</span>
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Xóa cuộc trò chuyện</span>
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa cuộc trò chuyện?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa cuộc trò chuyện với{' '}
                            <span className="font-semibold">{otherParticipant.name}</span>? Hành động
                            này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
