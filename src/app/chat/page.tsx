'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ConversationList } from '@/features/chat/components';
import { useChat } from '@/features/chat/hooks/useChat';
import { LoadingSpinner } from '@/features/chat/components/ui';
import { ParticipantType } from '@/features/chat/types';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TOKEN_KEY } from '@/constants';

export default function ChatPage() {
    const router = useRouter();
    const { isLoading, user } = useAuth();

    const { 
        conversations, 
        isLoadingConversations, 
        currentUserId, 
        initialize, 
        loadConversations,
        deleteConversation 
    } = useChat();
    console.log('Conversations:', conversations);

    // Initialize socket and load conversations
    useEffect(() => {
        if (!user?.userId) return;

        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            console.error('No token found');
            return;
        }

        // Initialize socket connection
        initialize(user.userId, ParticipantType.USER, token);

        // Load conversations
        loadConversations();
    }, [user?.userId, initialize, loadConversations]);

    const handleSelectConversation = (conversationId: string) => {
        const conversation = conversations.find((c) => c._id === conversationId);

        if (conversation?.otherParticipant) {
            if (conversation.otherParticipant.type === ParticipantType.COMPANY) {
                router.push(`/chat/company/${conversation.otherParticipant.id}`);
            } else {
                router.push(`/chat/user/${conversation.otherParticipant.id}`);
            }
        }
    };

    const handleDeleteConversation = async (conversationId: string) => {
        try {
            await deleteConversation(conversationId);
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const handleViewProfile = (participantId: string, participantType: ParticipantType) => {
        if (participantType === ParticipantType.COMPANY) {
            router.push(`/company/${participantId}`);
        } else {
            router.push(`/profile/${participantId}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" message="Đang tải..." />
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <ConversationList
                conversations={conversations}
                currentUserId={currentUserId}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                onViewProfile={handleViewProfile}
                activeConversationId={null}
                isLoading={isLoadingConversations}
            />

            <div className="flex flex-1 items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-blue-100 p-6">
                            <MessageCircle className="h-16 w-16 text-blue-500" />
                        </div>
                    </div>
                    <h2 className="mb-2 text-2xl font-semibold text-gray-700">Tin nhắn</h2>
                    <p className="text-gray-500">
                        Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
                    </p>
                </div>
            </div>
        </div>
    );
}
