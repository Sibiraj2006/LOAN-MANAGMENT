import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import {
  Search,
  Eye,
  ClipboardList,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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

export default function MyLeads() {
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const { data: leads, isLoading } = trpc.leads.myLeads.useQuery();

  const filteredLeads = leads?.filter(lead =>
    !search ||
    lead.customerName.toLowerCase().includes(search.toLowerCase()) ||
    lead.mobileNumber.includes(search) ||
    lead.businessName.toLowerCase().includes(search.toLowerCase()) ||
    lead.leadReferenceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (lead: any) => {
    setSelectedLead(lead);
    setViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Leads</h1>
          <p className="text-sm text-slate-500">View all your submitted customer leads</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, mobile, reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Submitted Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-medium text-slate-500">S.No</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Reference No.</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Customer</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500 hidden md:table-cell">Mobile</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500 hidden lg:table-cell">Business</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    </td>
                  </tr>
                )}
                {!isLoading && filteredLeads?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      {search ? 'No leads match your search.' : 'No leads submitted yet.'}
                    </td>
                  </tr>
                )}
                {filteredLeads?.map((lead, idx) => (
                  <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 text-slate-600">{idx + 1}</td>
                    <td className="py-3 px-2 font-mono text-xs text-blue-600">{lead.leadReferenceNumber}</td>
                    <td className="py-3 px-2 text-slate-600 whitespace-nowrap">
                      {new Date(lead.submittedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-800">{lead.customerName}</td>
                    <td className="py-3 px-2 text-slate-600 hidden md:table-cell">{lead.mobileNumber}</td>
                    <td className="py-3 px-2 text-slate-600 hidden lg:table-cell max-w-[150px] truncate">
                      {lead.businessName}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={statusColors[lead.status] || 'bg-slate-100'}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleView(lead)}
                        className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Lead Details
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2 rounded"><span className="text-slate-500">Reference:</span> <span className="font-mono font-medium text-blue-600">{selectedLead.leadReferenceNumber}</span></div>
                <div className="bg-slate-50 p-2 rounded"><span className="text-slate-500">Date:</span> {new Date(selectedLead.submittedAt).toLocaleString('en-IN')}</div>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-semibold text-slate-700 mb-2">Customer Information</h4>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="text-slate-500">Name:</span> {selectedLead.customerName}</p>
                  <p><span className="text-slate-500">Owner:</span> {selectedLead.ownerName}</p>
                  <p><span className="text-slate-500">Mobile:</span> {selectedLead.mobileNumber}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-semibold text-slate-700 mb-2">Business Information</h4>
                <div className="space-y-1">
                  <p><span className="text-slate-500">Name:</span> {selectedLead.businessName}</p>
                  <p><span className="text-slate-500">Type:</span> {selectedLead.natureOfBusiness}</p>
                  <p><span className="text-slate-500">Address:</span> {selectedLead.businessAddress}</p>
                  <p><span className="text-slate-500">City:</span> {selectedLead.cityTown}</p>
                  <p><span className="text-slate-500">Years:</span> {selectedLead.yearsInBusiness}</p>
                  <p><span className="text-slate-500">Turnover:</span> {selectedLead.monthlyTurnover}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-semibold text-slate-700 mb-2">Status</h4>
                <Badge variant="outline" className={statusColors[selectedLead.status] || 'bg-slate-100'}>
                  {selectedLead.status}
                </Badge>
                {selectedLead.remarks && (
                  <p className="mt-2"><span className="text-slate-500">Remarks:</span> {selectedLead.remarks}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
