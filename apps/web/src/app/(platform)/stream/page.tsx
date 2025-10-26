import { Suspense } from 'react';
import { StreamContent } from '@/components/stream/StreamContent';
import { Container } from '@/components/ui';

function StreamPageContent() {
  return (
    <Container className="py-6">
      <StreamContent />
    </Container>
  );
}

export default function StreamPage() {
  return (
    <Suspense fallback={
      <Container className="py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Container>
    }>
      <StreamPageContent />
    </Suspense>
  );
}

