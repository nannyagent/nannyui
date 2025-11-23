
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const CookiesPage = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy | Linux Agents API</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <TransitionWrapper>
          <main className="flex-1 container mx-auto py-12 px-4">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl">Cookie Policy</CardTitle>
                <CardDescription>Last updated: {new Date().toISOString().split('T')[0]}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                  <p className="text-muted-foreground">
                    This Cookie Policy explains how Linux Agents API ("we", "us", or "our") uses cookies and similar technologies 
                    to recognize you when you visit our website. It explains what these technologies are and why we use them, 
                    as well as your rights to control our use of them.
                  </p>
                </section>
                
                <Separator />
                
                <section>
                  <h2 className="text-xl font-semibold mb-2">2. What are cookies?</h2>
                  <p className="text-muted-foreground mb-4">
                    Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
                    Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, 
                    as well as to provide reporting information.
                  </p>
                  <p className="text-muted-foreground">
                    Cookies set by the website owner (in this case, Linux Agents API) are called "first-party cookies". 
                    Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies 
                    enable third-party features or functionality to be provided on or through the website (e.g., advertising, 
                    interactive content and analytics).
                  </p>
                </section>
                
                <Separator />
                
                <section>
                  <h2 className="text-xl font-semibold mb-2">3. Why do we use cookies?</h2>
                  <p className="text-muted-foreground mb-4">
                    We use first-party cookies for several reasons. Some cookies are required for technical reasons in order 
                    for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other 
                    cookies also enable us to track and target the interests of our users to enhance the experience on our website.
                  </p>
                  <p className="text-muted-foreground">
                    The specific types of first-party cookies served through our website and the purposes they perform are described below:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-2 text-muted-foreground">
                    <li>
                      <strong>Essential cookies:</strong> These cookies are strictly necessary to provide you with services available 
                      through our website and to use some of its features, such as access to secure areas. Because these cookies are 
                      strictly necessary to deliver the website, you cannot refuse them without impacting how our website functions.
                    </li>
                    <li>
                      <strong>Performance and functionality cookies:</strong> These cookies are used to enhance the performance and 
                      functionality of our website but are non-essential to their use. However, without these cookies, certain 
                      functionality may become unavailable.
                    </li>
                    <li>
                      <strong>Analytics and customization cookies:</strong> These cookies collect information that is used either in 
                      aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, 
                      or to help us customize our website for you.
                    </li>
                  </ul>
                </section>
                
                <Separator />
                
                <section>
                  <h2 className="text-xl font-semibold mb-2">4. What data do we collect?</h2>
                  <p className="text-muted-foreground mb-4">
                    Our website collects the following data:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-2 text-muted-foreground">
                    <li>
                      <strong>IP address:</strong> We collect your IP address for security purposes, to help prevent fraud and 
                      abuse, and to analyze traffic patterns to improve our service.
                    </li>
                    <li>
                      <strong>GitHub profile information:</strong> When you sign in using GitHub, we collect your GitHub profile 
                      information to authenticate your identity and personalize your experience. This information is only collected 
                      when you choose to sign in.
                    </li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    We use this data to:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-2 text-muted-foreground">
                    <li>Provide and maintain our service</li>
                    <li>Identify and authenticate users</li>
                    <li>Monitor usage of our service for security and improvement</li>
                    <li>Detect, prevent, and address technical issues</li>
                  </ul>
                </section>
                
                <Separator />
                
                <section>
                  <h2 className="text-xl font-semibold mb-2">5. How can you control cookies?</h2>
                  <p className="text-muted-foreground mb-4">
                    You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences 
                    by clicking on the appropriate opt-out links provided in the cookie banner.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, 
                    you may still use our website though your access to some functionality and areas of our website may be restricted.
                  </p>
                  <p className="text-muted-foreground">
                    Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, 
                    including how to see what cookies have been set, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.allaboutcookies.org</a>.
                  </p>
                </section>
                
                <Separator />
                
                <section>
                  <h2 className="text-xl font-semibold mb-2">6. GDPR Compliance</h2>
                  <p className="text-muted-foreground mb-4">
                    We are committed to ensuring that our cookie practices comply with the General Data Protection Regulation (GDPR) 
                    and other applicable data protection laws. This includes:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-2 text-muted-foreground">
                    <li>Obtaining valid consent before setting non-essential cookies</li>
                    <li>Providing clear and comprehensive information about the cookies we use</li>
                    <li>Enabling users to withdraw consent as easily as they gave it</li>
                    <li>Documenting consents received</li>
                  </ul>
                </section>
                
                <Separator />
                
                <section>
                  <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about our use of cookies or this Cookie Policy, please contact us at: 
                    <a href="mailto:support@nannyai.dev" className="text-primary hover:underline ml-1">support@nannyai.dev</a>
                  </p>
                </section>
              </CardContent>
            </Card>
          </main>
        </TransitionWrapper>
        
        <Footer />
      </div>
    </>
  );
};

export default CookiesPage;
