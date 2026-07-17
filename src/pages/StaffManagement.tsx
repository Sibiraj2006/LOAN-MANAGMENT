import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import {
  Users,
  Plus,
  Pencil,
  Lock,
  Power,
  PowerOff,
  Search,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function StaffManagement() {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [message, setMessage] = useState('');

  const utils = trpc.useUtils();
  const { data: staffList, isLoading } = trpc.staff.list.useQuery();

  // Form states
  const [addForm, setAddForm] = useState({ staffName: '', username: '', email: '', mobileNumber: '', password: '' });
  const [editForm, setEditForm] = useState({ staffName: '', email: '', mobileNumber: '' });
  const [newPassword, setNewPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const createStaff = trpc.staff.create.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setMessage(data.message);
        setAddOpen(false);
        setAddForm({ staffName: '', username: '', email: '', mobileNumber: '', password: '' });
        utils.staff.list.invalidate();
        utils.dashboard.adminStats.invalidate();
      } else {
        setFormErrors({ general: data.message });
      }
    },
  });

  const updateStaff = trpc.staff.update.useMutation({
    onSuccess: () => {
      setMessage('Staff updated successfully.');
      setEditOpen(false);
      utils.staff.list.invalidate();
      utils.dashboard.adminStats.invalidate();
    },
  });

  const resetPassword = trpc.staff.resetPassword.useMutation({
    onSuccess: () => {
      setMessage('Password reset successfully.');
      setResetOpen(false);
      setNewPassword('');
    },
  });

  const toggleStatus = trpc.staff.toggleStatus.useMutation({
    onSuccess: (data) => {
      setMessage(data.message);
      utils.staff.list.invalidate();
      utils.dashboard.adminStats.invalidate();
    },
  });

  const filteredStaff = staffList?.filter(s =>
    !search ||
    s.staffName.toLowerCase().includes(search.toLowerCase()) ||
    s.staffId.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const validateAdd = () => {
    const e: Record<string, string> = {};
    if (!addForm.staffName.trim() || addForm.staffName.length < 2) e.staffName = 'Name must be at least 2 characters.';
    if (!addForm.username.trim() || addForm.username.length < 3) e.username = 'Username must be at least 3 characters.';
    if (!addForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email.';
    if (!addForm.mobileNumber.match(/^\d{10}$/)) e.mobileNumber = 'Enter a valid 10-digit number.';
    if (!addForm.password || addForm.password.length < 6) e.password = 'Password must be at least 6 characters.';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validateAdd()) return;
    createStaff.mutate(addForm);
  };

  const handleEdit = (staff: any) => {
    setSelectedStaff(staff);
    setEditForm({ staffName: staff.staffName, email: staff.email, mobileNumber: staff.mobileNumber });
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedStaff) return;
    updateStaff.mutate({ id: selectedStaff.id, ...editForm });
  };

  const handleResetPassword = (staff: any) => {
    setSelectedStaff(staff);
    setNewPassword('');
    setResetOpen(true);
  };

  const handleResetSubmit = () => {
    if (!selectedStaff || !newPassword || newPassword.length < 6) return;
    resetPassword.mutate({ id: selectedStaff.id, newPassword });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-sm text-slate-500">Create and manage staff accounts</p>
        </div>
        <Button onClick={() => { setAddOpen(true); setFormErrors({}); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {message}
          <button onClick={() => setMessage('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Staff
            </CardTitle>
            <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search staff..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-3 font-medium text-slate-500">S.No</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Staff ID</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Name</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500 hidden md:table-cell">Username</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500 hidden lg:table-cell">Email</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Mobile</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={8} className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" /></td></tr>
                )}
                {!isLoading && filteredStaff?.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-slate-400">{search ? 'No staff match your search.' : 'No staff members yet.'}</td></tr>
                )}
                {filteredStaff?.map((staff, idx) => (
                  <tr key={staff.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-600">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono text-xs text-blue-600">{staff.staffId}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{staff.staffName}</td>
                    <td className="py-3 px-3 text-slate-600 hidden md:table-cell">{staff.username}</td>
                    <td className="py-3 px-3 text-slate-600 hidden lg:table-cell text-xs">{staff.email}</td>
                    <td className="py-3 px-3 text-slate-600">{staff.mobileNumber}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={staff.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {staff.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(staff)} className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleResetPassword(staff)} className="p-1.5 hover:bg-amber-50 rounded-md text-amber-600" title="Reset Password">
                          <Lock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus.mutate({ id: staff.id })}
                          className={`p-1.5 rounded-md ${staff.isActive ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                          title={staff.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {staff.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
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

      {/* Add Staff Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Staff
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {formErrors.general && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />{formErrors.general}
              </div>
            )}
            <div>
              <Label>Staff Name *</Label>
              <Input value={addForm.staffName} onChange={e => setAddForm(p => ({ ...p, staffName: e.target.value }))} placeholder="Enter full name" />
              {formErrors.staffName && <p className="text-xs text-red-500 mt-1">{formErrors.staffName}</p>}
            </div>
            <div>
              <Label>Username *</Label>
              <Input value={addForm.username} onChange={e => setAddForm(p => ({ ...p, username: e.target.value }))} placeholder="Choose a username" />
              {formErrors.username && <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>}
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} placeholder="Enter email address" />
              {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <Label>Mobile Number *</Label>
              <Input value={addForm.mobileNumber} onChange={e => setAddForm(p => ({ ...p, mobileNumber: e.target.value.replace(/\D/g, '') }))} placeholder="10 digit mobile number" maxLength={10} />
              {formErrors.mobileNumber && <p className="text-xs text-red-500 mt-1">{formErrors.mobileNumber}</p>}
            </div>
            <div>
              <Label>Password *</Label>
              <Input type="password" value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" />
              {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
            </div>
            <Button onClick={handleAdd} disabled={createStaff.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
              {createStaff.isPending ? 'Creating...' : 'Create Staff'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit Staff
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Staff Name</Label>
              <Input value={editForm.staffName} onChange={e => setEditForm(p => ({ ...p, staffName: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label>Mobile Number</Label>
              <Input value={editForm.mobileNumber} onChange={e => setEditForm(p => ({ ...p, mobileNumber: e.target.value.replace(/\D/g, '') }))} maxLength={10} />
            </div>
            <Button onClick={handleUpdate} disabled={updateStaff.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
              {updateStaff.isPending ? 'Updating...' : 'Update Staff'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Reset Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Reset password for <span className="font-medium">{selectedStaff?.staffName}</span> ({selectedStaff?.staffId})
            </p>
            <div>
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <Button onClick={handleResetSubmit} disabled={resetPassword.isPending || !newPassword || newPassword.length < 6} className="w-full bg-amber-600 hover:bg-amber-700">
              {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
