
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Building, Bell, Mail, Shield, Database, Download, Upload, LogOut, Home } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Shahi Multi Car Care',
    address: 'We Repair All Types of Cars',
    phone: '+91 10838000313',
    email: 'tohidsayyad@gmail.com',
    website: 'www.shahimulticarcare.com',
    taxId: 'GST-SHAHI-001'
  });

  const [notifications, setNotifications] = useState({
    lowStock: true,
    upcomingServices: true,
    emailReports: false,
    smsAlerts: true
  });

  const [backup, setBackup] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    lastBackup: '2024-01-15'
  });

  const handleSaveCompany = () => {
    // In a real app, this would save to the database
    toast({
      title: "Success",
      description: "Company information updated successfully",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Success",
      description: "Notification preferences updated successfully",
    });
  };

  const handleBackupNow = () => {
    toast({
      title: "Backup Started",
      description: "Creating backup of your data...",
    });
    // Simulate backup process
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Backup completed successfully",
      });
    }, 2000);
  };

  const handleImportData = () => {
    toast({
      title: "Import Feature",
      description: "Data import functionality coming soon",
    });
  };

  const handleLogout = () => {
    // Clear authentication from localStorage
    localStorage.removeItem('shahiGarageAuth');
    localStorage.removeItem('shahiGarageAuthTime');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    
    // Reload the page to trigger the authentication check
    window.location.reload();
  };

  const handleReturnToWelcome = () => {
    // Clear authentication to force return to welcome page
    localStorage.removeItem('shahiGarageAuth');
    localStorage.removeItem('shahiGarageAuthTime');
    
    toast({
      title: "Returning to Welcome",
      description: "Redirecting to the landing page",
    });
    
    // Reload the page to trigger the welcome page
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your application settings and preferences</p>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company_phone">Phone Number</Label>
              <Input
                id="company_phone"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_email">Email</Label>
              <Input
                id="company_email"
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company_website">Website</Label>
              <Input
                id="company_website"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company_address">Address</Label>
            <Textarea
              id="company_address"
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="tax_id">Tax ID</Label>
            <Input
              id="tax_id"
              value={companyInfo.taxId}
              onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
            />
          </div>

          <Button onClick={handleSaveCompany}>
            Save Company Information
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="low_stock">Low Stock Alerts</Label>
              <p className="text-sm text-gray-600">Get notified when parts are running low</p>
            </div>
            <Switch
              id="low_stock"
              checked={notifications.lowStock}
              onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="upcoming_services">Upcoming Service Reminders</Label>
              <p className="text-sm text-gray-600">Notifications for scheduled services</p>
            </div>
            <Switch
              id="upcoming_services"
              checked={notifications.upcomingServices}
              onCheckedChange={(checked) => setNotifications({ ...notifications, upcomingServices: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_reports">Email Reports</Label>
              <p className="text-sm text-gray-600">Receive weekly/monthly reports via email</p>
            </div>
            <Switch
              id="email_reports"
              checked={notifications.emailReports}
              onCheckedChange={(checked) => setNotifications({ ...notifications, emailReports: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms_alerts">SMS Alerts</Label>
              <p className="text-sm text-gray-600">Critical alerts via SMS</p>
            </div>
            <Switch
              id="sms_alerts"
              checked={notifications.smsAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, smsAlerts: checked })}
            />
          </div>

          <Button onClick={handleSaveNotifications}>
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Backup Settings</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatic Backup</Label>
                  <p className="text-sm text-gray-600">Enable automatic data backups</p>
                </div>
                <Switch
                  checked={backup.autoBackup}
                  onCheckedChange={(checked) => setBackup({ ...backup, autoBackup: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Last Backup</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{backup.lastBackup}</Badge>
                  <Button size="sm" onClick={handleBackupNow}>
                    <Download className="h-4 w-4 mr-2" />
                    Backup Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Import/Export */}
            <div className="space-y-4">
              <h3 className="font-medium">Import/Export</h3>
              
              <div className="space-y-2">
                <Label>Data Export</Label>
                <p className="text-sm text-gray-600">Export your data for backup or migration</p>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Data Import</Label>
                <p className="text-sm text-gray-600">Import data from external sources</p>
                <Button variant="outline" size="sm" onClick={handleImportData}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Session Timeout</Label>
              <p className="text-sm text-gray-600 mb-2">Automatically log out after inactivity</p>
              <select className="w-full p-2 border rounded-md">
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>

            <div>
              <Label>Data Retention</Label>
              <p className="text-sm text-gray-600 mb-2">How long to keep old records</p>
              <select className="w-full p-2 border rounded-md">
                <option value="365">1 year</option>
                <option value="730">2 years</option>
                <option value="1095">3 years</option>
                <option value="0">Keep forever</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Version:</span> 1.0.0</p>
              <p><span className="font-medium">Database:</span> Supabase</p>
              <p><span className="font-medium">Last Updated:</span> January 2024</p>
            </div>
            <div>
              <p><span className="font-medium">Total Customers:</span> 156</p>
              <p><span className="font-medium">Total Parts:</span> 1,234</p>
              <p><span className="font-medium">Total Services:</span> 299</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <LogOut className="mr-2 h-5 w-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label>Return to Welcome Page</Label>
              <p className="text-sm text-gray-600 mb-4">Go back to the main landing page and showcase of Shahi Multi Car Care.</p>
              <Button variant="outline" onClick={handleReturnToWelcome} className="mr-4">
                <Home className="h-4 w-4 mr-2" />
                Return to Landing Page
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <Label>Device Access</Label>
              <p className="text-sm text-gray-600 mb-4">Log out from this device. You will need to enter the password again to access the system.</p>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout from this Device
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
