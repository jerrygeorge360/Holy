export interface Repository {
  id: string;
  name: string;
  owner: string;
  language: string;
  stars: number;
  issues: number;
  prs: number;
  lastReview: string;
  status: 'active' | 'paused' | 'setup';
  branch: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: string;
  repo: string;
  status: 'approved' | 'changes-requested' | 'pending';
  issuesFound: number;
  createdAt: string;
  reviewedAt?: string;
}

export interface Issue {
  id: string;
  type: 'security' | 'performance' | 'bug' | 'style' | 'best-practice';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file: string;
  line: number;
  prNumber: number;
  repo: string;
}

export const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'webapp-frontend',
    owner: 'acme-corp',
    language: 'TypeScript',
    stars: 234,
    issues: 12,
    prs: 45,
    lastReview: '2 hours ago',
    status: 'active',
    branch: 'main',
  },
  {
    id: '2',
    name: 'api-service',
    owner: 'acme-corp',
    language: 'Python',
    stars: 156,
    issues: 8,
    prs: 32,
    lastReview: '5 hours ago',
    status: 'active',
    branch: 'main',
  },
  {
    id: '3',
    name: 'mobile-app',
    owner: 'acme-corp',
    language: 'JavaScript',
    stars: 89,
    issues: 3,
    prs: 18,
    lastReview: '1 day ago',
    status: 'paused',
    branch: 'develop',
  },
];

export const mockPullRequests: PullRequest[] = [
  {
    id: '1',
    number: 342,
    title: 'Add user authentication flow',
    author: 'sarah-dev',
    repo: 'webapp-frontend',
    status: 'changes-requested',
    issuesFound: 5,
    createdAt: '2024-02-11T10:30:00Z',
    reviewedAt: '2024-02-11T11:15:00Z',
  },
  {
    id: '2',
    number: 341,
    title: 'Optimize database queries',
    author: 'john-backend',
    repo: 'api-service',
    status: 'approved',
    issuesFound: 0,
    createdAt: '2024-02-11T09:00:00Z',
    reviewedAt: '2024-02-11T09:45:00Z',
  },
  {
    id: '3',
    number: 340,
    title: 'Fix navigation bug on iOS',
    author: 'mike-mobile',
    repo: 'mobile-app',
    status: 'pending',
    issuesFound: 2,
    createdAt: '2024-02-12T08:00:00Z',
  },
  {
    id: '4',
    number: 339,
    title: 'Update dependencies',
    author: 'sarah-dev',
    repo: 'webapp-frontend',
    status: 'approved',
    issuesFound: 1,
    createdAt: '2024-02-10T14:20:00Z',
    reviewedAt: '2024-02-10T15:00:00Z',
  },
];

export const mockIssues: Issue[] = [
  {
    id: '1',
    type: 'security',
    severity: 'critical',
    title: 'Potential SQL injection vulnerability',
    description: 'User input is not properly sanitized before being used in database query',
    file: 'src/auth/login.ts',
    line: 42,
    prNumber: 342,
    repo: 'webapp-frontend',
  },
  {
    id: '2',
    type: 'performance',
    severity: 'high',
    title: 'Inefficient loop causing O(n²) complexity',
    description: 'Nested loop can be optimized using a hash map',
    file: 'src/utils/processor.ts',
    line: 156,
    prNumber: 342,
    repo: 'webapp-frontend',
  },
  {
    id: '3',
    type: 'best-practice',
    severity: 'medium',
    title: 'Missing error handling',
    description: 'Async function should have try-catch block',
    file: 'src/api/fetch.ts',
    line: 23,
    prNumber: 342,
    repo: 'webapp-frontend',
  },
  {
    id: '4',
    type: 'bug',
    severity: 'high',
    title: 'Null reference exception possible',
    description: 'Object property accessed without null check',
    file: 'src/screens/Home.tsx',
    line: 89,
    prNumber: 340,
    repo: 'mobile-app',
  },
  {
    id: '5',
    type: 'style',
    severity: 'low',
    title: 'Inconsistent naming convention',
    description: 'Variable names should use camelCase',
    file: 'src/components/Button.tsx',
    line: 12,
    prNumber: 339,
    repo: 'webapp-frontend',
  },
];

export const getRepoById = (id: string) => mockRepositories.find(repo => repo.id === id);
export const getPRsByRepo = (repoName: string) => mockPullRequests.filter(pr => pr.repo === repoName);
export const getIssuesByPR = (prNumber: number) => mockIssues.filter(issue => issue.prNumber === prNumber);
export const getIssuesByRepo = (repoName: string) => mockIssues.filter(issue => issue.repo === repoName);