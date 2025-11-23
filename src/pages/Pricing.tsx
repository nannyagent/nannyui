
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Server, Shield, Users, Clock, Zap, MessageCircle, Database } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import TransitionWrapper from '@/components/TransitionWrapper';
import { getPricingPlans, type PricingPlan } from '@/services/pricingService';

const PlanFeature: React.FC<{ name: string; included: boolean }> = ({ name, included }) => (
  <div className="flex items-center mb-3">
    {included ? (
      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
    )}
    <span className={included ? '' : 'text-muted-foreground'}>{name}</span>
  </div>
);

const Pricing = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      const data = await getPricingPlans();
      setPlans(data);
      setLoading(false);
    };
    loadPlans();
  }, []);

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'free': return Server;
      case 'basic': return Shield;
      case 'pro': return Users;
      default: return Server;
    }
  };

  const getPlanColor = (slug: string) => {
    switch (slug) {
      case 'free': return { bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'basic': return { bg: 'bg-purple-50', border: 'border-purple-200' };
      case 'pro': return { bg: 'bg-amber-50', border: 'border-amber-200' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return '$0';
    return `$${(cents / 100).toFixed(0)}`;
  };

  const getPlanFeatures = (plan: PricingPlan) => [
    { name: `Up to ${plan.max_agents} agent${plan.max_agents > 1 ? 's' : ''}`, included: true },
    { name: plan.core_api_access ? 'Core API access' : 'No API access', included: plan.core_api_access },
    { name: `${plan.monitoring} monitoring`, included: true },
    { name: `${plan.support} support`, included: true },
    { name: `${plan.api_calls_per_day.toLocaleString()} API calls / day`, included: true },
    { name: `${plan.tokens_per_day.toLocaleString()} tokens / day`, included: true },
    { name: `Data retention: ${plan.data_retention_days} days`, included: true },
    { name: 'Advanced security features', included: plan.advanced_security },
    { name: 'Priority support', included: plan.priority_support },
    { name: 'Custom agents', included: plan.custom_agents },
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Quick Setup',
      description: 'Get started in minutes with our simple onboarding process'
    },
    {
      icon: Zap,
      title: 'High Performance',
      description: 'Fast response times with global distribution'
    },
    {
      icon: MessageCircle,
      title: 'Expert Support',
      description: 'Get help when you need it from our support team'
    },
    {
      icon: Database,
      title: 'Reliable Infrastructure',
      description: '99.9% uptime guarantee across all our services'
    }
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
        <Navbar />
        
        <TransitionWrapper className="flex-1 overflow-y-auto">
          <div className="container py-8 px-4">
            <div className="mb-8 text-center max-w-3xl mx-auto">
              <motion.h1 
                className="text-4xl font-bold tracking-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Simple, Transparent Pricing
              </motion.h1>
              <motion.p 
                className="text-xl text-muted-foreground mt-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Choose the plan that best fits your needs. All plans include access to our API.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {loading ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground">Loading pricing plans...</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground">No pricing plans available</p>
                </div>
              ) : (
                plans.map((plan, i) => {
                  const Icon = getPlanIcon(plan.slug);
                  const colors = getPlanColor(plan.slug);
                  const features = getPlanFeatures(plan);
                  const isPopular = plan.slug === 'basic';
                  const cta = plan.slug === 'free' ? 'Start for Free' : 
                              plan.slug === 'pro' ? 'Contact Sales' : 'Start 14-Day Trial';
                  const description = plan.features?.notes || 
                                    (plan.slug === 'free' ? 'For personal projects and small teams' :
                                     plan.slug === 'basic' ? 'For growing businesses and teams' :
                                     'For enterprises and large teams');

                  return (
                    <motion.div
                      key={plan.plan_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.4 }}
                      className="flex flex-col"
                    >
                      <Card className={`h-full flex flex-col ${isPopular ? 'border-2 border-primary shadow-lg' : ''}`}>
                        {isPopular && (
                          <div className="bg-primary text-primary-foreground text-xs font-medium text-center py-1 rounded-t-md">
                            MOST POPULAR
                          </div>
                        )}
                        <CardHeader className={`${colors.bg} rounded-t-lg`}>
                          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle>{plan.name}</CardTitle>
                          <div className="mt-2 flex items-baseline">
                            <span className="text-3xl font-bold">{formatPrice(plan.monthly_price_cents)}</span>
                            {plan.monthly_price_cents > 0 && <span className="text-muted-foreground ml-1">/month</span>}
                          </div>
                          <CardDescription className="mt-2">{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <div className="pt-4">
                            {features.map((feature, index) => (
                              <PlanFeature 
                                key={index} 
                                name={feature.name} 
                                included={feature.included} 
                              />
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <button 
                            className={`w-full py-2 px-4 rounded-md text-center ${
                              isPopular 
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            } font-medium transition-colors`}
                          >
                            {cta}
                          </button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
            
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our API Platform?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, i) => (
                  <Card key={i} className="border border-border/50">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="max-w-3xl mx-auto text-center bg-muted/30 p-8 rounded-lg border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
              <p className="text-muted-foreground mb-6">
                Contact our sales team for custom pricing and enterprise features.
                We offer tailored solutions for large-scale deployments.
              </p>
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-6 rounded-md transition-colors">
                Contact Sales
              </button>
            </motion.div>
          </div>
          <Footer />
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default Pricing;
