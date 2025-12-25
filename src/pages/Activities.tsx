import React from 'react';
import { Construction } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import withAuth from '@/utils/withAuth';

const Activities = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto flex items-center justify-center">
          <TransitionWrapper>
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="flex justify-center">
                <div className="p-6 bg-primary/10 rounded-full">
                  <Construction className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Under Construction</h1>
              <p className="text-muted-foreground text-lg">
                The Activities page is currently being built. Check back soon for updates on system events and audit logs.
              </p>
            </div>
          </TransitionWrapper>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default withAuth(Activities);
