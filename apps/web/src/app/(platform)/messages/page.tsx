import { Suspense } from 'react';
import { MessagesContainer } from '@/components/messages/MessagesContainer';

function MessagesPageContent() {
  return <MessagesContainer />;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}

