import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import withAuth from '@/utils/withAuth';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  TrendingUp,
  Server,
  ChevronLeft,
  ChevronRight,
  Activity,
  FileText,
  Clock,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import TransitionWrapper from '@/components/TransitionWrapper';
import ErrorBanner from '@/components/ErrorBanner';
import { getPatchManagementData, type PatchManagementData, type Package as PatchPackage } from '@/services/patchManagementService';
import { Badge } from '@/components/ui/badge';

const PatchManagement = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [data, setData] = useState<PatchManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPatchData();
  }, [agentId]);

  const loadPatchData = async () => {
    if (!agentId) return;
    
    setLoading(true);
    setHasError(false);
    
    try {
      const patchData = await getPatchManagementData(agentId);
      setData(patchData);
    } catch (error) {
      console.error('Error fetching patch data:', error);
      setHasError(true);
      setErrorMessage('Failed to load patch management data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter packages based on severity
  const filteredPackages = data?.packages.filter(pkg => {
    if (severityFilter === 'all') return true;
    
    // Hide packages with no vulnerabilities or only low severity when filtering
    const hasRelevantVulns = pkg.vulnerabilities.some(vuln => {
      if (severityFilter === 'critical') return vuln.severity === 'critical';
      if (severityFilter === 'high') return vuln.severity === 'high' || vuln.severity === 'critical';
      if (severityFilter === 'medium') return vuln.severity === 'medium' || vuln.severity === 'high' || vuln.severity === 'critical';
      return false;
    });
    
    return hasRelevantVulns;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPackages = filteredPackages.slice(startIndex, startIndex + itemsPerPage);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      default: return <ShieldCheck className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading patch management data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          
          <TransitionWrapper className="flex-1 overflow-y-auto">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-8">
              {hasError && (
                <ErrorBanner 
                  message={errorMessage}
                  onDismiss={() => setHasError(false)}
                />
              )}

              {/* Header */}
              <div className="mb-8">
                <Link 
                  to="/agents" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Agents
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Patch Management</h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      Security vulnerabilities and available updates for agent {agentId?.substring(0, 8)}
                    </p>
                  </div>
                </div>
              </div>

              {data && (
                <>
                  {/* System Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-lg p-4 sm:p-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Server className="h-5 w-5 text-primary" />
                        <Badge variant="outline" className="text-xs">{data.architecture}</Badge>
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">System</h3>
                      <p className="text-base sm:text-lg font-bold mt-1 break-words">{data.os_distribution} {data.os_version}</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-card border border-border rounded-lg p-4 sm:p-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <Badge variant="outline" className="text-xs">{data.package_manager}</Badge>
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Kernel</h3>
                      <p className="text-base sm:text-lg font-bold mt-1 break-words">{data.kernel_version}</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-card border border-border rounded-lg p-4 sm:p-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Packages</h3>
                      <p className="text-2xl sm:text-3xl font-bold mt-1">{data.summary.total_packages_checked}</p>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-card border border-border rounded-lg p-4 sm:p-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Last Analysis</h3>
                      <p className="text-sm sm:text-base font-semibold mt-1">
                        {new Date(data.analysis_timestamp).toLocaleString()}
                      </p>
                    </motion.div>
                  </div>

                  {/* Vulnerability Summary */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-card to-card/50 border border-border rounded-lg p-4 sm:p-6 mb-8"
                  >
                    <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" />
                      Security Overview
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 sm:p-4 border-l-4 border-red-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium text-red-900 dark:text-red-100">Critical</span>
                          <ShieldAlert className="h-4 w-4 text-red-600" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-red-600">{data.summary.critical_vulnerabilities}</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 sm:p-4 border-l-4 border-orange-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium text-orange-900 dark:text-orange-100">High</span>
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-orange-600">{data.summary.high_vulnerabilities}</p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 sm:p-4 border-l-4 border-yellow-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium text-yellow-900 dark:text-yellow-100">Medium</span>
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{data.summary.medium_vulnerabilities}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 border-l-4 border-green-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">Updates</span>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600">{data.summary.packages_with_updates}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Filter Buttons */}
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="text-sm font-medium text-muted-foreground">Filter:</span>
                    {['all', 'critical', 'high', 'medium'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setSeverityFilter(filter as any);
                          setCurrentPage(1);
                        }}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all capitalize ${
                          severityFilter === filter
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* Packages List */}
                  <div className="space-y-3 sm:space-y-4 mb-8">
                    {paginatedPackages.length === 0 ? (
                      <div className="text-center py-12 bg-card border border-border rounded-lg">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No vulnerabilities found</h3>
                        <p className="text-sm text-muted-foreground">
                          {severityFilter === 'all' 
                            ? 'All packages are up to date with no security issues.' 
                            : `No ${severityFilter} severity vulnerabilities detected.`}
                        </p>
                      </div>
                    ) : (
                      paginatedPackages.map((pkg, idx) => (
                        <motion.div
                          key={`${pkg.name}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-base sm:text-lg font-bold break-all">{pkg.name}</h3>
                                {pkg.upgrade_available && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 text-xs">
                                    Update Available
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                                <span className="break-all">Current: <span className="font-mono font-semibold">{pkg.current_version}</span></span>
                                {pkg.upgrade_available && (
                                  <span className="break-all">→ Available: <span className="font-mono font-semibold text-green-600">{pkg.available_version}</span></span>
                                )}
                              </div>

                              {pkg.vulnerabilities.length > 0 && (
                                <div className="space-y-2">
                                  {pkg.vulnerabilities
                                    .filter(vuln => vuln.severity !== 'low' || severityFilter === 'all')
                                    .map((vuln, vIdx) => (
                                      <div 
                                        key={vIdx} 
                                        className={`flex flex-col sm:flex-row sm:items-start gap-2 p-3 rounded-md ${getSeverityColor(vuln.severity)}`}
                                      >
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {getSeverityIcon(vuln.severity)}
                                          <Badge className={`uppercase text-xs ${getSeverityColor(vuln.severity)}`}>
                                            {vuln.severity || 'unknown'}
                                          </Badge>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          {vuln.cve_id && (
                                            <p className="font-mono text-xs sm:text-sm font-semibold mb-1 break-all">{vuln.cve_id}</p>
                                          )}
                                          {vuln.description && (
                                            <p className="text-xs sm:text-sm break-words">{vuln.description}</p>
                                          )}
                                          {vuln.cvss_score && (
                                            <p className="text-xs mt-1">CVSS Score: <span className="font-semibold">{vuln.cvss_score}</span></p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPackages.length)} of {filteredPackages.length} packages
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm px-3 py-1 bg-muted rounded-md">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {data.recommendations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6"
                    >
                      <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center text-blue-900 dark:text-blue-100">
                        <FileText className="h-5 w-5 mr-2" />
                        Recommendations
                      </h2>
                      <ul className="space-y-2">
                        {data.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                            <span className="break-words">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </TransitionWrapper>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default withAuth(PatchManagement);
