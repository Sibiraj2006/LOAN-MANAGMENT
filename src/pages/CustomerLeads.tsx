import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import {
  ClipboardList,
  Search,
  Eye,
  Pencil,
  Trash2,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

const statusOptions = ['New', 'Pending', 'Contacted', 'FollowUp', 'DocumentsPending', 'DocumentsVerified', 'Completed', 'Rejected'];

const businessTypes = [
  'Grocery', 'Super Market', 'Tea Stall', 'Bakery', 'Hotel', 'Restaurant',
  'Fast Food', 'Catering', 'Mess', 'Tiffin Center', 'Snacks Center',
  'Juice Shop', 'Dairy', 'Milk Center', 'Textile', 'Garments',
  'Hardware', 'Electrical', 'Electronics', 'Mobile Shop', 'Medical Shop',
  'Automobile', 'Two Wheeler Service', 'Beauty Parlour', 'Salon',
  'Construction', 'Manufacturing', 'Wholesale', 'Retail', 'Home Food', 'Other',
];

export default function CustomerLeads() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    staffId: '',
    businessType: '',
    cityTown: '',
    fromDate: '',
    toDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const utils = trpc.useUtils();
  const { data: result, isLoading } = trpc.leads.search.useQuery({
    search: search || undefined,
    status: filters.status || undefined,
    staffId: filters.staffId ? Number(filters.staffId) : undefined,
    businessType: filters.businessType || undefined,
    cityTown: filters.cityTown || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  });

  const { data: staffList } = trpc.staff.list.useQuery();

  const updateLead = trpc.leads.update.useMutation({
    onSuccess: (data) => {
      setMessage(data.message);
      setEditOpen(false);
      utils.leads.search.invalidate();
      utils.dashboard.adminStats.invalidate();
    },
  });

  const deleteLead = trpc.leads.delete.useMutation({
    onSuccess: (data) => {
      setMessage(data.message);
      setDeleteConfirm(null);
      utils.leads.search.invalidate();
      utils.dashboard.adminStats.invalidate();
    },
  });

  const handleView = (lead: any) => {
    setSelectedLead(lead);
    setViewOpen(true);
  };

  const handleEdit = (lead: any) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditRemarks(lead.remarks || '');
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedLead) return;
    updateLead.mutate({
      id: selectedLead.id,
      status: editStatus as any,
      remarks: editRemarks,
    });
  };

  const resetFilters = () => {
    setFilters({ status: '', staffId: '', businessType: '', cityTown: '', fromDate: '', toDate: '' });
    setSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customer Leads</h1>
          <p className="text-sm text-slate-500">View and manage all customer lead records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {message}
          <button onClick={() => setMessage('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, mobile, reference, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Status</Label>
                <select
                  value={filters.status}
                  onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
                  className="w-full h-9 px-2 rounded-md border text-sm"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Staff</Label>
                <select
                  value={filters.staffId}
                  onChange={e => setFilters(p => ({ ...p, staffId: e.target.value }))}
                  className="w-full h-9 px-2 rounded-md border text-sm"
                >
                  <option value="">All Staff</option>
                  {staffList?.map(s => <option key={s.id} value={s.id}>{s.staffName}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Business Type</Label>
                <select
                  value={filters.businessType}
                  onChange={e => setFilters(p => ({ ...p, businessType: e.target.value }))}
                  className="w-full h-9 px-2 rounded-md border text-sm"
                >
                  <option value="">All Types</option>
                  {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">From Date</Label>
                <Input type="date" value={filters.fromDate} onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">To Date</Label>
                <Input type="date" value={filters.toDate} onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))} />
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={resetFilters} className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        Showing {result?.leads?.length || 0} of {result?.total || 0} records
      </p>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Ref No.</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Staff</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Customer</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500 hidden md:table-cell">Mobile</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500 hidden lg:table-cell">Business</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500 hidden sm:table-cell">Type</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={9} className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" /></td></tr>
                )}
                {!isLoading && result?.leads?.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-8 text-slate-400">No leads found.</td></tr>
                )}
                {result?.leads?.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-xs text-blue-600 whitespace-nowrap">{lead.leadReferenceNumber}</td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {new Date(lead.submittedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-slate-700 text-xs">{lead.staffUser?.staffName}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{lead.customerName}</td>
                    <td className="py-3 px-3 text-slate-600 hidden md:table-cell">{lead.mobileNumber}</td>
                    <td className="py-3 px-3 text-slate-600 hidden lg:table-cell max-w-[120px] truncate">{lead.businessName}</td>
                    <td className="py-3 px-3 text-slate-600 hidden sm:table-cell text-xs">{lead.natureOfBusiness}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={statusColors[lead.status] || 'bg-slate-100'}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleView(lead)} className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(lead)} className="p-1.5 hover:bg-green-50 rounded-md text-green-600" title="Edit Status">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(lead.id)} className="p-1.5 hover:bg-red-50 rounded-md text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
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
                <div className="bg-slate-50 p-2 rounded"><span className="text-slate-500">Reference:</span> <span className="font-mono font-medium text-blue-600 text-xs">{selectedLead.leadReferenceNumber}</span></div>
                <div className="bg-slate-50 p-2 rounded"><span className="text-slate-500">Date:</span> {new Date(selectedLead.submittedAt).toLocaleString('en-IN')}</div>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-semibold text-slate-700 mb-2">Staff Information</h4>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="text-slate-500">Name:</span> {selectedLead.staffUser?.staffName}</p>
                  <p><span className="text-slate-500">ID:</span> {selectedLead.staffUser?.staffId}</p>
                </div>
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
                  <p><span className="text-slate-500">Existing Loan:</span> {selectedLead.hasExistingBusinessLoan ? 'Yes' : 'No'}</p>
                  {selectedLead.hasExistingBusinessLoan && selectedLead.existingLoanCompanyName && (
                    <p><span className="text-slate-500">Loan Company:</span> {selectedLead.existingLoanCompanyName}</p>
                  )}
                </div>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-semibold text-slate-700 mb-2">Lead Status</h4>
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

      {/* Edit Status Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Update Lead Status
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Customer: <span className="font-medium">{selectedLead?.customerName}</span>
              <br />
              Ref: <span className="font-mono text-xs text-blue-600">{selectedLead?.leadReferenceNumber}</span>
            </p>
            <div>
              <Label>Status</Label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-md border text-sm"
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Remarks</Label>
              <textarea
                value={editRemarks}
                onChange={e => setEditRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm min-h-[80px]"
                placeholder="Add remarks..."
              />
            </div>
            <Button onClick={handleUpdate} disabled={updateLead.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
              {updateLead.isPending ? 'Updating...' : 'Update Lead'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">Are you sure you want to delete this lead? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteLead.mutate({ id: deleteConfirm })}
              disabled={deleteLead.isPending}
            >
              {deleteLead.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
