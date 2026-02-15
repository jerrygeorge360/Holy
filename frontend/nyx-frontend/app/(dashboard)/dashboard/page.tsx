import { 
  GitBranch, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Shield,
  Zap,
  Bug,
  ChevronRight
} from 'lucide-react';
import { mockRepositories, mockPullRequests, mockIssues } from '../../../component/mockData/mock-data';
import Button from '@/shared/Button';

export default function page() {
  const totalRepos = mockRepositories.length;
  const activeRepos = mockRepositories.filter(r => r.status === 'active').length;
  const totalPRsReviewed = mockPullRequests.length;
  const totalIssues = mockIssues.length;
  const criticalIssues = mockIssues.filter(i => i.severity === 'critical').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200 flex items-center px-2 md:px-4 py-1 md:py-2 rounded-2xl text-xs md:text-sm';
      case 'changes-requested': return 'bg-red-100 text-red-800 border-red-200 flex items-center px-2 md:px-4 py-1 md:py-2 rounded-2xl text-xs md:text-sm';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center px-2 md:px-4 py-1 md:py-2 rounded-2xl text-xs md:text-sm';
      default: return 'bg-slate-100 text-slate-800 border-slate-200 flex items-center px-2 md:px-4 py-1 md:py-2 rounded-2xl text-xs md:text-sm';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 px-2 py-1 rounded-full text-xs';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 px-2 py-1 rounded-full text-xs';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 px-2 py-1 rounded-full text-xs';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200 px-2 py-1 rounded-full text-xs';
      default: return 'bg-slate-100 text-slate-800 border-slate-200 px-2 py-1 rounded-full text-xs';
    }
  };

  return (
    <div className="bg-[#f8fbffa7] mx-auto px-3 md:px-4 py-4 md:py-8">
      {/* Page Header */}
      <div className="mb-4 md:mb-8 mx-2 md:mx-6">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-1 md:mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-slate-600">Overview of your code review activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-8 mx-2 md:mx-6">
        <div className='border border-gray-400 px-3 md:px-4 py-3 md:py-4 rounded-lg bg-white'>
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs md:text-sm font-medium text-slate-600">Connected Repos</h3>
            <GitBranch className="w-3 h-3 md:w-4 md:h-4 text-slate-600" />
          </div>
          <div className='rounded-2xl'>
            <div className="text-xl md:text-2xl font-bold text-black">{totalRepos}</div>
            <p className="text-xs text-slate-600 mt-1">{activeRepos} active</p>
          </div>
        </div>

        <div className='border border-gray-400 px-3 md:px-4 py-3 md:py-4 rounded-lg bg-white'>
          <div className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs md:text-sm font-medium text-slate-600">PRs Reviewed</p>
            <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-black">{totalPRsReviewed}</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-2 h-2 md:w-3 md:h-3" />
              +12% this week
            </p>
          </div>
        </div>

        <div className='border border-gray-400 px-3 md:px-4 py-3 md:py-4 rounded-lg bg-white'>
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs md:text-sm font-medium text-slate-600">Issues Found</h3>
            <Bug className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-black">{totalIssues}</div>
            <p className="text-xs text-slate-600 mt-1">{criticalIssues} critical</p>
          </div>
        </div>

        <div className='border border-gray-400 px-3 md:px-4 py-3 md:py-4 rounded-lg bg-white'>
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-xs md:text-sm font-medium text-slate-600">Avg Review Time</h3>
            <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-black">2.3s</div>
            <p className="text-xs text-slate-600 mt-1">per pull request</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-8 mx-2 md:mx-6">
        {/* Connected Repositories */}
        <div className='border border-gray-400 rounded-2xl md:rounded-3xl px-4 md:px-6 py-4 md:py-6 bg-white'>
          <div>
            <div className='mb-3 md:mb-4'>
              <h3 className='text-black text-sm md:text-[16px] font-bold'>Connected Repositories</h3>
              <p className='text-gray-400 text-xs md:text-[12px]'>Your active repositories</p>
            </div>
            <div>
              <div className="space-y-3 md:space-y-4">
                {mockRepositories.map((repo:any) => (
                  <div key={repo.id}>
                    <div className="flex items-center justify-between p-3 md:p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-black text-sm md:text-[16px] truncate">{repo.owner}/{repo.name}</h4>
                          <div
                            className={
                              repo.status === 'active' ? 'bg-green-100 text-green-800 border-green-200 px-2 md:px-4 py-0.5 rounded-2xl text-xs' : 
                              repo.status === 'paused' ? 'bg-slate-100 text-slate-800 border-slate-200 px-2 md:px-4 py-0.5 rounded-2xl text-xs' :
                              'bg-blue-100 text-blue-800 border-blue-200 px-2 md:px-4 py-0.5 rounded-2xl text-xs'
                            }
                          >
                            {repo.status}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-600">
                          <span>{repo.language}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{repo.prs} PRs</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden md:inline">{repo.issues} issues</span>
                          <span className="hidden lg:inline">•</span>
                          <span className="hidden lg:inline">Last: {repo.lastReview}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-3 md:mt-4 text-gray-400 text-xs md:text-sm py-2 md:py-3">
                Connect New Repository
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Pull Requests */}
        <div className='border border-gray-400 rounded-2xl md:rounded-3xl px-4 md:px-6 py-4 md:py-6 bg-white'>
          <div>
            <div className='mb-3 md:mb-4'>
              <h3 className='text-black text-sm md:text-[16px] font-bold'>Recent Pull Requests</h3>
              <p className='text-gray-400 text-xs md:text-[12px]'>Latest AI reviews</p>
            </div>
            <div>
              <div className="space-y-3 md:space-y-4">
                {mockPullRequests.slice(0, 4).map((pr:any) => (
                  <div 
                    key={pr.id} 
                    className="p-3 md:p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1 text-black text-sm md:text-[16px] truncate">{pr.title}</h4>
                        <p className="text-xs md:text-sm text-slate-600 truncate">
                          #{pr.number} • {pr.repo} • by {pr.author}
                        </p>
                      </div>
                      <div className={getStatusColor(pr.status)}>
                        {pr.status === 'approved' && <CheckCircle2 className="w-2 h-2 md:w-3 md:h-3 mr-1" />}
                        {pr.status === 'changes-requested' && <AlertCircle className="w-2 h-2 md:w-3 md:h-3 mr-1" />}
                        {pr.status === 'pending' && <Clock className="w-2 h-2 md:w-3 md:h-3 mr-1" />}
                        <span className="hidden sm:inline">{pr.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                    {pr.issuesFound > 0 && (
                      <div className="text-xs md:text-sm text-slate-600">
                        {pr.issuesFound} issue{pr.issuesFound !== 1 ? 's' : ''} found
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Issues */}
      {criticalIssues > 0 && (
        <div className="mt-4 md:mt-8 border-red-400 bg-red-200/30 py-3 md:py-4 rounded-lg">
          <div className='mx-3 md:mx-6'>
            <div className='mb-2 md:mb-[4px]'>
              <h3 className="flex items-center gap-2 text-red-900 text-sm md:text-base font-semibold">
                <Shield className="w-4 h-4 md:w-5 md:h-5" />
                Critical Issues Detected
              </h3>
              <p className='text-black text-xs md:text-[12px]'>These issues require immediate attention</p>
            </div>
            <div>
              <div className="space-y-2 md:space-y-3">
                {mockIssues.filter(i => i.severity === 'critical').map((issue:any) => (
                  <div key={issue.id} className="p-3 md:p-4 bg-white border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </div>
                          <div className="bg-slate-100 text-slate-800 border-slate-200 px-2 py-1 rounded-full text-xs">
                            {issue.type}
                          </div>
                        </div>
                        <h4 className="font-medium mb-1 text-sm md:text-base">{issue.title}</h4>
                        <p className="text-xs md:text-sm text-slate-600 mb-2">{issue.description}</p>
                        <p className="text-xs md:text-sm text-slate-500 truncate">
                          {issue.file}:{issue.line} • PR #{issue.prNumber} • {issue.repo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}