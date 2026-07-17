import { useState } from 'react'
import { useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  Send,
  CheckCircle,
  Plus,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

const businessTypes = [
  'Grocery', 'Super Market', 'Tea Stall', 'Bakery', 'Hotel', 'Restaurant',
  'Fast Food', 'Catering', 'Mess', 'Tiffin Center', 'Snacks Center',
  'Juice Shop', 'Dairy', 'Milk Center', 'Textile', 'Garments',
  'Hardware', 'Electrical', 'Electronics', 'Mobile Shop', 'Medical Shop',
  'Automobile', 'Two Wheeler Service', 'Beauty Parlour', 'Salon',
  'Construction', 'Manufacturing', 'Wholesale', 'Retail', 'Home Food', 'Other',
];

const turnoverRanges = [
  'Below \u20b950,000',
  '\u20b950,000 \u2013 \u20b91 Lakh',
  '\u20b91 Lakh \u2013 \u20b93 Lakhs',
  '\u20b93 Lakhs \u2013 \u20b95 Lakhs',
  '\u20b95 Lakhs \u2013 \u20b910 Lakhs',
  '\u20b910 Lakhs \u2013 \u20b925 Lakhs',
  'Above \u20b925 Lakhs',
];

export default function AddCustomer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitData, setSubmitData] = useState<{
    customerName: string;
    leadReferenceNumber: string;
    submittedAt: Date;
  } | null>(null);

  const [form, setForm] = useState({
    customerName: '',
    ownerName: '',
    mobileNumber: '',
    businessName: '',
    businessAddress: '',
    cityTown: '',
    natureOfBusiness: '',
    otherBusinessType: '',
    yearsInBusiness: '',
    monthlyTurnover: '',
    hasExistingBusinessLoan: false,
    existingLoanCompanyName: '',
    existingLoanOutstandingAmount: '',
    contactConsent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createLead = trpc.leads.create.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSubmitted(true);
        setSubmitData({
          customerName: form.customerName,
          leadReferenceNumber: data.leadReferenceNumber || '',
          submittedAt: new Date(),
        });
      }
    },
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim() || form.customerName.length < 2) e.customerName = 'Customer name must be at least 2 characters.';
    if (!/^[a-zA-Z\s]+$/.test(form.customerName)) e.customerName = 'Only letters and spaces allowed.';
    if (!form.ownerName.trim() || form.ownerName.length < 2) e.ownerName = 'Owner name must be at least 2 characters.';
    if (!form.mobileNumber.match(/^[6-9]\d{9}$/)) e.mobileNumber = 'Enter a valid 10-digit Indian mobile number.';
    if (!form.businessName.trim()) e.businessName = 'Business name is required.';
    if (!form.businessAddress.trim()) e.businessAddress = 'Business address is required.';
    if (!form.cityTown.trim()) e.cityTown = 'City/Town is required.';
    if (!form.natureOfBusiness) e.natureOfBusiness = 'Select nature of business.';
    if (form.natureOfBusiness === 'Other' && !form.otherBusinessType.trim()) e.otherBusinessType = 'Specify business type.';
    if (!form.yearsInBusiness || Number(form.yearsInBusiness) < 0) e.yearsInBusiness = 'Enter valid years (0+).';
    if (!form.monthlyTurnover) e.monthlyTurnover = 'Select monthly turnover.';
    if (!form.contactConsent) e.contactConsent = 'You must agree to be contacted.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createLead.mutate({
      customerName: form.customerName,
      ownerName: form.ownerName,
      mobileNumber: form.mobileNumber,
      businessName: form.businessName,
      businessAddress: form.businessAddress,
      cityTown: form.cityTown,
      natureOfBusiness: form.natureOfBusiness,
      otherBusinessType: form.otherBusinessType || undefined,
      yearsInBusiness: Number(form.yearsInBusiness),
      monthlyTurnover: form.monthlyTurnover,
      hasExistingBusinessLoan: form.hasExistingBusinessLoan,
      existingLoanCompanyName: form.existingLoanCompanyName || undefined,
      existingLoanOutstandingAmount: form.existingLoanOutstandingAmount ? Number(form.existingLoanOutstandingAmount) : undefined,
      contactConsent: form.contactConsent,
    });
  };

  const update = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  if (submitted && submitData) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="text-center py-10">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Customer Details Submitted Successfully
            </h2>
            <div className="bg-slate-50 rounded-lg p-4 text-left space-y-2">
              <p><span className="text-slate-500">Customer Name:</span> <span className="font-medium">{submitData.customerName}</span></p>
              <p><span className="text-slate-500">Lead Reference:</span> <span className="font-mono font-medium text-blue-600">{submitData.leadReferenceNumber}</span></p>
              <p><span className="text-slate-500">Date & Time:</span> <span className="font-medium">{submitData.submittedAt.toLocaleString('en-IN')}</span></p>
              <p><span className="text-slate-500">Submitted By:</span> <span className="font-medium">{user?.staffName} ({user?.staffId})</span></p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => {
                setSubmitted(false);
                setSubmitData(null);
                setForm({
                  customerName: '', ownerName: '', mobileNumber: '', businessName: '',
                  businessAddress: '', cityTown: '', natureOfBusiness: '', otherBusinessType: '',
                  yearsInBusiness: '', monthlyTurnover: '', hasExistingBusinessLoan: false,
                  existingLoanCompanyName: '', existingLoanOutstandingAmount: '', contactConsent: false,
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Another Customer
              </Button>
              <Button variant="outline" onClick={() => navigate('/my-leads')}>
                <ClipboardList className="w-4 h-4 mr-2" />
                View My Leads
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Your information is safe and will not be shared with unauthorized third parties.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add New Customer</h1>
        <p className="text-sm text-slate-500">Enter customer and business details for loan assistance</p>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            BUSINESS & OWNER DETAILS
          </CardTitle>
          <p className="text-sm text-slate-500">Please provide accurate details for loan assistance</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div>
                <Label>Customer Name *</Label>
                <Input
                  placeholder="Enter customer name"
                  value={form.customerName}
                  onChange={e => update('customerName', e.target.value)}
                  className={errors.customerName ? 'border-red-300' : ''}
                />
                {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
              </div>

              {/* Owner Name */}
              <div>
                <Label>Owner Name *</Label>
                <Input
                  placeholder="Enter owner name"
                  value={form.ownerName}
                  onChange={e => update('ownerName', e.target.value)}
                  className={errors.ownerName ? 'border-red-300' : ''}
                />
                {errors.ownerName && <p className="text-xs text-red-500 mt-1">{errors.ownerName}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <Label>Mobile Number *</Label>
                <Input
                  placeholder="Enter 10 digit mobile number"
                  maxLength={10}
                  value={form.mobileNumber}
                  onChange={e => update('mobileNumber', e.target.value.replace(/\D/g, ''))}
                  className={errors.mobileNumber ? 'border-red-300' : ''}
                />
                {errors.mobileNumber && <p className="text-xs text-red-500 mt-1">{errors.mobileNumber}</p>}
              </div>

              {/* Business Name */}
              <div>
                <Label>Business Name *</Label>
                <Input
                  placeholder="Enter business name"
                  value={form.businessName}
                  onChange={e => update('businessName', e.target.value)}
                  className={errors.businessName ? 'border-red-300' : ''}
                />
                {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>}
              </div>
            </div>

            {/* Business Address */}
            <div>
              <Label>Business Address *</Label>
              <Textarea
                placeholder="Enter full business address"
                rows={3}
                value={form.businessAddress}
                onChange={e => update('businessAddress', e.target.value)}
                className={errors.businessAddress ? 'border-red-300' : ''}
              />
              {errors.businessAddress && <p className="text-xs text-red-500 mt-1">{errors.businessAddress}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City/Town */}
              <div>
                <Label>City / Town *</Label>
                <Input
                  placeholder="Enter city or town"
                  value={form.cityTown}
                  onChange={e => update('cityTown', e.target.value)}
                  className={errors.cityTown ? 'border-red-300' : ''}
                />
                {errors.cityTown && <p className="text-xs text-red-500 mt-1">{errors.cityTown}</p>}
              </div>

              {/* Nature of Business */}
              <div>
                <Label>Nature of Business *</Label>
                <div className="relative">
                  <select
                    value={form.natureOfBusiness}
                    onChange={e => update('natureOfBusiness', e.target.value)}
                    className={`w-full h-10 px-3 rounded-md border bg-white text-sm ${errors.natureOfBusiness ? 'border-red-300' : 'border-input'}`}
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {errors.natureOfBusiness && <p className="text-xs text-red-500 mt-1">{errors.natureOfBusiness}</p>}
              </div>

              {/* Other Business Type */}
              {form.natureOfBusiness === 'Other' && (
                <div>
                  <Label>Other Business Type</Label>
                  <Input
                    placeholder="Enter business type"
                    value={form.otherBusinessType}
                    onChange={e => update('otherBusinessType', e.target.value)}
                  />
                </div>
              )}

              {/* Years in Business */}
              <div>
                <Label>Years in Business *</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Enter years in business"
                  value={form.yearsInBusiness}
                  onChange={e => update('yearsInBusiness', e.target.value)}
                  className={errors.yearsInBusiness ? 'border-red-300' : ''}
                />
                {errors.yearsInBusiness && <p className="text-xs text-red-500 mt-1">{errors.yearsInBusiness}</p>}
              </div>

              {/* Monthly Turnover */}
              <div>
                <Label>Monthly Turnover (Approx.) *</Label>
                <select
                  value={form.monthlyTurnover}
                  onChange={e => update('monthlyTurnover', e.target.value)}
                  className={`w-full h-10 px-3 rounded-md border bg-white text-sm ${errors.monthlyTurnover ? 'border-red-300' : 'border-input'}`}
                >
                  <option value="">Select turnover range</option>
                  {turnoverRanges.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.monthlyTurnover && <p className="text-xs text-red-500 mt-1">{errors.monthlyTurnover}</p>}
              </div>
            </div>

            {/* Existing Business Loan */}
            <div>
              <Label className="mb-2 block">Existing Business Loan? *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="existingLoan"
                    checked={form.hasExistingBusinessLoan === true}
                    onChange={() => update('hasExistingBusinessLoan', true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="existingLoan"
                    checked={form.hasExistingBusinessLoan === false}
                    onChange={() => update('hasExistingBusinessLoan', false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {/* Existing Loan Details */}
            {form.hasExistingBusinessLoan && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label>Bank / Finance Company Name</Label>
                  <Input
                    placeholder="Enter company name"
                    value={form.existingLoanCompanyName}
                    onChange={e => update('existingLoanCompanyName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Approximate Outstanding Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={form.existingLoanOutstandingAmount}
                    onChange={e => update('existingLoanOutstandingAmount', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Contact Consent */}
            <div className={`p-4 rounded-lg border ${errors.contactConsent ? 'border-red-300 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={form.contactConsent}
                  onCheckedChange={(checked) => update('contactConsent', checked === true)}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="consent" className="font-medium text-sm cursor-pointer">
                    I agree to be contacted
                  </Label>
                  <p className="text-xs text-slate-600 mt-1">
                    I authorize the team to contact me for loan-related information and offers via call/SMS/WhatsApp.
                  </p>
                  {errors.contactConsent && <p className="text-xs text-red-500 mt-1">{errors.contactConsent}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createLead.isPending}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Send className="w-4 h-4 mr-2" />
              {createLead.isPending ? 'Submitting...' : 'SUBMIT DETAILS'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
