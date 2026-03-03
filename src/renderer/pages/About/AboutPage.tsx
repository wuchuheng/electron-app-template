import React from 'react';
import { AppAboutContent } from '@/renderer/components/AppAboutContent';

export const AboutPage: React.FC = () => {
  return (
    <div className="h-full overflow-auto bg-background-primary p-8">
      <AppAboutContent />
    </div>
  );
};
