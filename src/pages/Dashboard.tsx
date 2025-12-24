"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Key, Users, Clock, ArrowUpRight, Activity } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import GlassMorphicCard from '@/components/GlassMorphicCard';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import withAuth from '@/utils/withAuth';
import { placeholderStats, placeholderActivities } from '@/mocks/placeholderData';
import { getCurrentUser, getCurrentSession } from '@/services/authService';
import { getRecentActivities, getActivityIcon, formatActivityTime, type Activity as ActivityType } from '@/services/activityService';
import { getRecentInvestigationsFromAPI, formatInvestigationTime, type Investigation } from '@/services/investigationService';
import { getDashboardStats } from '@/services/statsService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("There was an issue loading your dashboard data.");
  const [stats, setStats] = useState(placeholderStats);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [usePlaceholder, setUsePlaceholder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data and dashboard information
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const currentUser = await getCurrentUser();
        const session = await getCurrentSession();
        
        if (!currentUser || !session) {
          console.error('No user or session found');
          navigate('/login');
          return;
        }
        
        setUser(currentUser);
        
        // Fetch real data from Supabase with timeouts to prevent hanging
        try {
          // Add timeout wrapper for all API calls
          const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 15000): Promise<T> => {
            return Promise.race([
              promise,
              new Promise<T>((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
              )
            ]);
          };
          
          // Fetch all data in parallel with timeouts
          const [recentActivities, recentInvestigations, dashboardStats] = await Promise.allSettled([
            withTimeout(getRecentActivities(5)),
            withTimeout(getRecentInvestigationsFromAPI(5)),
            withTimeout(getDashboardStats())
          ]);
          
          // Handle activities
          if (recentActivities.status === 'fulfilled' && recentActivities.value && recentActivities.value.length > 0) {
            setActivities(recentActivities.value);
            setUsePlaceholder(false);
          } else {
            console.log('No activities found or request failed:', recentActivities.status === 'rejected' ? recentActivities.reason : 'No data');
            setActivities([]);
            setUsePlaceholder(true);
          }
          
          // Handle investigations
          if (recentInvestigations.status === 'fulfilled' && recentInvestigations.value) {
            setInvestigations(recentInvestigations.value);
          } else {
            console.log('Failed to fetch investigations:', recentInvestigations.status === 'rejected' ? recentInvestigations.reason : 'No data');
            setInvestigations([]);
          }
          
          // Handle stats
          if (dashboardStats.status === 'fulfilled' && dashboardStats.value) {
            const stats = dashboardStats.value;
            setStats([
              { 
                title: 'Total Agents', 
                value: String(stats.totalAgents), 
                icon: 'Server', 
                change: '+15%' 
              },
              { 
                title: 'Active Tokens', 
                value: String(stats.activeTokens), 
                icon: 'Key', 
                change: '+20%' 
              },
              { 
                title: 'Total Users', 
                value: String(stats.totalUsers), 
                icon: 'Users', 
                change: '+8%' 
              },
              { 
                title: 'Uptime', 
                value: stats.uptime, 
                icon: 'Clock', 
                change: '+0.2%' 
              },
            ]);
          } else {
            console.log('Failed to fetch dashboard stats:', dashboardStats.status === 'rejected' ? dashboardStats.reason : 'No data');
          }
          
        } catch (dataError) {
          console.error('Error fetching dashboard data:', dataError);
          setErrorMessage("Could not load data from Supabase. Check if the 'activities' table exists.");
          setHasError(true);
          setUsePlaceholder(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setErrorMessage("Error loading dashboard. Please try again.");
        setHasError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <TransitionWrapper className="flex-1 p-6">
            <div className="container pb-8">
            {hasError && (
              <ErrorBanner 
                message={errorMessage}
                onDismiss={() => setHasError(false)}
              />
            )}
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground mt-2">
                    Welcome back! Here's an overview of your API services.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.4 }}
                    >
                      <GlassMorphicCard className="h-full">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {stat.icon === 'Server' && <Server className="h-5 w-5 text-primary" />}
                            {stat.icon === 'Key' && <Key className="h-5 w-5 text-primary" />}
                            {stat.icon === 'Users' && <Users className="h-5 w-5 text-primary" />}
                            {stat.icon === 'Clock' && <Clock className="h-5 w-5 text-primary" />}
                          </div>
                        </div>
                        <div className="mt-4 inline-flex items-center text-xs font-medium text-muted-foreground">
                          <span className={`mr-1 text-green-500`}>{stat.change}</span>
                          <span>from last month</span>
                        </div>
                      </GlassMorphicCard>
                    </motion.div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div 
                    className="lg:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <GlassMorphicCard className="h-full">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-medium">Recent Investigations</h3>
                        <button 
                          className="px-3 py-1 rounded bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                          onClick={() => navigate('/investigations')}
                        >
                          View All
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {investigations.length > 0 ? (
                          investigations.map((investigation: Investigation) => (
                            <div key={investigation.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Server className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{investigation.user_prompt}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  ID: {investigation.id}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    investigation.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    investigation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {investigation.priority}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    investigation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    investigation.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    investigation.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {investigation.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatInvestigationTime(investigation.created_at)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Server className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No investigations yet</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              Recent diagnostic investigations will appear here
                            </p>
                          </div>
                        )}
                      </div>
                    </GlassMorphicCard>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <GlassMorphicCard className="h-full">
                      <h3 className="font-medium mb-6">Recent Activities</h3>
                      
                      {activities.length > 0 ? (
                        <div className="space-y-4">
                          {activities.map((activity) => {
                            const iconName = activity.icon || getActivityIcon(activity.activity_type);
                            return (
                              <div key={activity.id} className="flex items-start space-x-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  {iconName === 'Server' && <Server className="h-4 w-4 text-primary" />}
                                  {iconName === 'Key' && <Key className="h-4 w-4 text-primary" />}
                                  {iconName === 'Activity' && <Activity className="h-4 w-4 text-primary" />}
                                  {iconName === 'Users' && <Users className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{activity.title}</p>
                                  {activity.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatActivityTime(activity.created_at)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">No activities yet</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Activities from agents, users, and sessions will appear here
                          </p>
                        </div>
                      )}
                      
                      {activities.length > 0 && (
                        <button 
                          className="mt-4 text-sm text-primary hover:text-primary/80 flex items-center"
                          onClick={() => navigate('/activities')}
                        >
                          View all activities <ArrowUpRight className="ml-1 h-3 w-3" />
                        </button>
                      )}
                    </GlassMorphicCard>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </TransitionWrapper>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const DashboardPage = withAuth(Dashboard);
export default DashboardPage;
