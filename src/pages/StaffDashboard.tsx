import { useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  Plus,
  FileText,
  Calendar,
  CalendarDays,
  BarChart3,
  Eye,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800 border-blue-200',
  Pending: 'bg-orange-100 text-orange-800 border-orange-200',
  Contacted: 'bg-purple-100 text-purple-800 border-purple-200',
  FollowUp: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DocumentsPending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DocumentsVerified: 'bg-teal-100 text-teal-800 border-teal-200',
  Completed: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.staffStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome, {user?.staffName}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Staff ID: <span className="font-medium text-slate-700">{user?.staffId}</span>
          </p>
        </div>
        <Button
          onClick={() => navigate('/add-customer')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          ADD NEW CUSTOMER
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Today's Forms</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {stats?.todayForms ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">This Week</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {stats?.weekForms ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">This Month</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {stats?.monthForms ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Forms</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {stats?.totalForms ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Submissions</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/my-leads')}
              className="text-blue-600"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-medium text-slate-500">S.No</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Customer</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500 hidden md:table-cell">Mobile</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500 hidden lg:table-cell">Business</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500 hidden sm:table-cell">Type</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentLeads?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No submissions yet. Start by adding a new customer.
                    </td>
                  </tr>
                )}
                {stats?.recentLeads?.map((lead, idx) => (
                  <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 text-slate-600">{idx + 1}</td>
                    <td className="py-3 px-2 text-slate-600 whitespace-nowrap">
                      {new Date(lead.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-800">{lead.customerName}</td>
                    <td className="py-3 px-2 text-slate-600 hidden md:table-cell">{lead.mobileNumber}</td>
                    <td className="py-3 px-2 text-slate-600 hidden lg:table-cell max-w-[150px] truncate">
                      {lead.businessName}
                    </td>
                    <td className="py-3 px-2 text-slate-600 hidden sm:table-cell">{lead.businessType}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={statusColors[lead.status] || 'bg-slate-100'}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/my-leads?view=${lead.id}`)}
                          className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
