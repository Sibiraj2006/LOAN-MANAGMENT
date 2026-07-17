import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import * as XLSX from 'xlsx'
import {
  Filter,
  Eye,
  RotateCcw,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Pending: 'bg-orange-100 text-orange-800',
  Contacted: 'bg-purple-100 text-purple-800',
  FollowUp: 'bg-indigo-100 text-indigo-800',
  DocumentsPending: 'bg-yellow-100 text-yellow-800',
  DocumentsVerified: 'bg-teal-100 text-teal-800',
  Completed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const businessTypes = [
  'Grocery', 'Super Market', 'Tea Stall', 'Bakery', 'Hotel', 'Restaurant',
  'Fast Food', 'Catering', 'Mess', 'Tiffin Center', 'Snacks Center',
  'Juice Shop', 'Dairy', 'Milk Center', 'Textile', 'Garments',
  'Hardware', 'Electrical', 'Electronics', 'Mobile Shop', 'Medical Shop',
  'Automobile', 'Two Wheeler Service', 'Beauty Parlour', 'Salon',
  'Construction', 'Manufacturing', 'Wholesale', 'Retail', 'Home Food', 'Other',
];

const statusOptions = ['New', 'Pending', 'Contacted', 'FollowUp', 'DocumentsPending', 'DocumentsVerified', 'Completed', 'Rejected'];

type ReportType = 'Daily' | 'Weekly' | 'Monthly' | 'Custom';

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('Daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [staffUserId, setStaffUserId] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [status, setStatus] = useState('');
  const [cityTown, setCityTown] = useState('');
  const [generated, setGenerated] = useState(false);

  const { data: staffList } = trpc.staff.list.useQuery();
  const { data: reportData, refetch } = trpc.reports.generate.useQuery(
    {
      reportType,
      selectedDate: reportType === 'Daily' ? selectedDate : undefined,
      fromDate: reportType === 'Weekly' || reportType === 'Custom' ? fromDate : undefined,
      toDate: reportType === 'Weekly' || reportType === 'Custom' ? toDate : undefined,
      month: reportType === 'Monthly' ? month : undefined,
      year: reportType === 'Monthly' ? year : undefined,
      staffUserId: staffUserId ? Number(staffUserId) : undefined,
      businessType: businessType || undefined,
      status: status || undefined,
      cityTown: cityTown || undefined,
    },
    { enabled: generated }
  );

  const handlePreview = () => {
    setGenerated(true);
    refetch();
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    // ─── Report Header ───
    const dateStr = reportData.fromDate
      ? new Date(reportData.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';
    const dayStr = reportData.fromDate
      ? new Date(reportData.fromDate).toLocaleDateString('en-IN', { weekday: 'long' })
      : '';

    const headerRows: any[][] = [
      [`REPORT DATE:`, dateStr, ``, reportData.title, ``, `TOTAL STAFF:`, String(reportData.totalStaff)],
      [`DAY:`, dayStr, ``, ``, ``, `TOTAL FORMS:`, String(reportData.totalForms)],
      [],
    ];

    // ─── Staff Wise Summary ───
    const summaryHeader = ['STAFF WISE SUMMARY'];
    const staffNames = reportData.staffSummary.map(s => s.staffName);
    const staffIds = reportData.staffSummary.map(s => s.staffId);
    const formsCompleted = reportData.staffSummary.map(s => String(s.formsCompleted));
    const customersEntered = reportData.staffSummary.map(s => String(s.customersEntered));

    const summaryRows = [
      summaryHeader,
      ['Staff Name', ...staffNames, 'TOTAL'],
      ['Staff ID', ...staffIds, ''],
      ['Forms Completed', ...formsCompleted, String(reportData.totalForms)],
      ['Customers Entered', ...customersEntered, String(reportData.totalCustomers)],
      [],
    ];

    // ─── Detailed Data ───
    const detailHeader = ['DETAILED CUSTOMER & FORMS INFORMATION'];
    const detailColumns = [
      'S.No', 'Date', 'Time', 'Staff Name', 'Staff ID', 'Customer Name', 'Owner Name',
      'Mobile No.', 'Business Name', 'Business Type', 'Business Address', 'City / Town',
      'Years in Business', 'Monthly Turnover', 'Existing Business Loan', 'Consent',
      'Lead Reference No.', 'Status', 'Remarks',
    ];

    const detailRows = reportData.leads.map((lead, idx) => [
      String(idx + 1),
      new Date(lead.date).toLocaleDateString('en-IN'),
      new Date(lead.time).toLocaleTimeString('en-IN'),
      lead.staffName,
      lead.staffId,
      lead.customerName,
      lead.ownerName,
      lead.mobileNumber,
      lead.businessName,
      lead.businessType,
      lead.businessAddress,
      lead.cityTown,
      String(lead.yearsInBusiness),
      lead.monthlyTurnover,
      lead.hasExistingBusinessLoan ? 'Yes' : 'No',
      lead.contactConsent ? 'Yes' : 'No',
      lead.leadReferenceNumber,
      lead.status,
      lead.remarks || '',
    ]);

    const allRows = [
      ...headerRows,
      ...summaryRows,
      detailHeader,
      detailColumns,
      ...detailRows,
      [],
      ['Note: Please ensure all details are entered correctly and documents are verified.'],
    ];

    XLSX.utils.sheet_add_aoa(ws, allRows);

    // ─── Set Column Widths ───
    ws['!cols'] = [
      { wch: 8 }, { wch: 14 }, { wch: 12 }, { wch: 40 }, { wch: 12 },
      { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 20 }, { wch: 14 },
      { wch: 30 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 20 },
      { wch: 10 }, { wch: 22 }, { wch: 14 }, { wch: 20 },
    ];

    // ─── Merge Cells for Title ───
    ws['!merges'] = [
      { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 3 }, e: { r: 1, c: 4 } },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Generate filename
    let fileName = '';
    switch (reportType) {
      case 'Daily':
        fileName = `Daily_Customer_Forms_Report_${selectedDate}.xlsx`;
        break;
      case 'Weekly':
        fileName = `Weekly_Customer_Forms_Report_${fromDate}_to_${toDate}.xlsx`;
        break;
      case 'Monthly': {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        fileName = `Monthly_Customer_Forms_Report_${monthNames[month]}_${year}.xlsx`;
        break;
      }
      case 'Custom':
        fileName = `Customer_Forms_Report_${fromDate}_to_${toDate}.xlsx`;
        break;
    }

    XLSX.writeFile(wb, fileName);
  };

  const handleReset = () => {
    setGenerated(false);
    setReportType('Daily');
    setSelectedDate(new Date().toISOString().slice(0, 10));
    setFromDate(new Date().toISOString().slice(0, 10));
    setToDate(new Date().toISOString().slice(0, 10));
    setStaffUserId('');
    setBusinessType('');
    setStatus('');
    setCityTown('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Export</h1>
        <p className="text-sm text-slate-500">Generate and export professional Excel reports</p>
      </div>

      {/* Report Type Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Report Type Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['Daily', 'Weekly', 'Monthly', 'Custom'] as ReportType[]).map(type => (
              <button
                key={type}
                onClick={() => { setReportType(type); setGenerated(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  reportType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'Custom' ? 'Custom Range' : `${type} Report`}
              </button>
            ))}
          </div>

          {/* Dynamic Date Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportType === 'Daily' && (
              <div>
                <Label>Select Date</Label>
                <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              </div>
            )}
            {reportType === 'Weekly' && (
              <>
                <div>
                  <Label>From Date</Label>
                  <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div>
                  <Label>To Date</Label>
                  <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
              </>
            )}
            {reportType === 'Monthly' && (
              <>
                <div>
                  <Label>Month</Label>
                  <select value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full h-10 px-3 rounded-md border text-sm">
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Year</Label>
                  <Input type="number" value={year} onChange={e => setYear(Number(e.target.value))} min={2020} max={2030} />
                </div>
              </>
            )}
            {reportType === 'Custom' && (
              <>
                <div>
                  <Label>From Date</Label>
                  <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div>
                  <Label>To Date</Label>
                  <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
              </>
            )}
          </div>

          {/* Optional Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-4">
            <div>
              <Label className="text-xs">Staff</Label>
              <select value={staffUserId} onChange={e => setStaffUserId(e.target.value)} className="w-full h-9 px-2 rounded-md border text-sm">
                <option value="">All Staff</option>
                {staffList?.map(s => <option key={s.id} value={s.id}>{s.staffName}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Business Type</Label>
              <select value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full h-9 px-2 rounded-md border text-sm">
                <option value="">All Types</option>
                {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-9 px-2 rounded-md border text-sm">
                <option value="">All Status</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">City / Town</Label>
              <Input placeholder="Filter by city" value={cityTown} onChange={e => setCityTown(e.target.value)} className="h-9" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handlePreview} className="bg-blue-600 hover:bg-blue-700">
              <Eye className="w-4 h-4 mr-2" />
              Preview Report
            </Button>
            {generated && reportData && (
              <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            )}
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {generated && reportData && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-blue-600 font-medium">Total Staff</p>
                <p className="text-2xl font-bold text-blue-800">{reportData.totalStaff}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-green-600 font-medium">Total Forms</p>
                <p className="text-2xl font-bold text-green-800">{reportData.totalForms}</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-purple-600 font-medium">Total Customers</p>
                <p className="text-2xl font-bold text-purple-800">{reportData.totalCustomers}</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-amber-600 font-medium">Report Period</p>
                <p className="text-sm font-bold text-amber-800">
                  {new Date(reportData.fromDate).toLocaleDateString('en-IN')}
                  {reportType !== 'Daily' && ` - ${new Date(reportData.toDate).toLocaleDateString('en-IN')}`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Staff Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Staff Wise Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left py-2 px-3 font-medium text-slate-600">Staff Name</th>
                      {reportData.staffSummary.map(s => (
                        <th key={s.staffId} className="text-center py-2 px-3 font-medium text-slate-600">{s.staffName}</th>
                      ))}
                      <th className="text-center py-2 px-3 font-bold text-slate-800">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-3 text-slate-500">Staff ID</td>
                      {reportData.staffSummary.map(s => (
                        <td key={s.staffId} className="text-center py-2 px-3 font-mono text-xs text-slate-600">{s.staffId}</td>
                      ))}
                      <td className="text-center py-2 px-3"></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3 font-medium text-slate-700">Forms Completed</td>
                      {reportData.staffSummary.map(s => (
                        <td key={s.staffId} className="text-center py-2 px-3 font-semibold">{s.formsCompleted}</td>
                      ))}
                      <td className="text-center py-2 px-3 font-bold text-blue-600">{reportData.totalForms}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-700">Customers Entered</td>
                      {reportData.staffSummary.map(s => (
                        <td key={s.staffId} className="text-center py-2 px-3 font-semibold">{s.customersEntered}</td>
                      ))}
                      <td className="text-center py-2 px-3 font-bold text-blue-600">{reportData.totalCustomers}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Records */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Detailed Records ({reportData.leads.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs">S.No</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs">Date</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs">Staff</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs">Customer</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs hidden md:table-cell">Mobile</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs hidden lg:table-cell">Business</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs hidden sm:table-cell">Type</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.leads.map((lead, idx) => (
                      <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2 px-2 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-2 text-slate-600 whitespace-nowrap text-xs">
                          {new Date(lead.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-2 px-2 text-slate-700 text-xs">{lead.staffName}</td>
                        <td className="py-2 px-2 font-medium text-slate-800">{lead.customerName}</td>
                        <td className="py-2 px-2 text-slate-600 hidden md:table-cell">{lead.mobileNumber}</td>
                        <td className="py-2 px-2 text-slate-600 hidden lg:table-cell max-w-[120px] truncate">{lead.businessName}</td>
                        <td className="py-2 px-2 text-slate-600 hidden sm:table-cell text-xs">{lead.businessType}</td>
                        <td className="py-2 px-2">
                          <Badge variant="outline" className={`text-xs ${statusColors[lead.status] || 'bg-slate-100'}`}>
                            {lead.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
