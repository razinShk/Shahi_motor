import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Receipt, Download } from 'lucide-react';
import { ServiceWithDetails } from '@/hooks/useServicesData';
import { numberToWords } from '@/utils/numberToWords';

interface ServiceInvoiceProps {
  service: ServiceWithDetails;
}

export const ServiceInvoice = ({ service }: ServiceInvoiceProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const totalPartsAmount = service.service_parts?.reduce((sum, part) => sum + Number(part.subtotal), 0) || 0;
  const grandTotal = Number(service.labor_charges || 0) + totalPartsAmount;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Receipt className="h-4 w-4 mr-2" />
          Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Service Invoice</DialogTitle>
        </DialogHeader>
        
        <div id="invoice-content" className="space-y-6 p-6 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shahi Multi Car Care</h1>
              <p className="text-gray-600">Engine • Suspension • Scanning • AC Works</p>
              <div className="mt-2 text-sm text-gray-600">
                <p>We Repair All Types of Cars</p>
                <p>Phone: +91 10838000313 | Email: tohidsayyad@gmail.com</p>
                <p>Contact: Tohid Sayyad</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-gray-600">#{service.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm text-gray-600">Date: {service.service_date}</p>
            </div>
          </div>

          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bill To:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold">{service.vehicles.customers.name}</p>
                  {service.vehicles.customers.email && (
                    <p className="text-sm text-gray-600">{service.vehicles.customers.email}</p>
                  )}
                  {service.vehicles.customers.phone && (
                    <p className="text-sm text-gray-600">{service.vehicles.customers.phone}</p>
                  )}
                  {service.vehicles.customers.address && (
                    <p className="text-sm text-gray-600">{service.vehicles.customers.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vehicle Information:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p><span className="font-medium">Make/Model:</span> {service.vehicles.make} {service.vehicles.model}</p>
                  <p><span className="font-medium">Year:</span> {service.vehicles.year}</p>
                  <p><span className="font-medium">Registration:</span> {service.vehicles.registration_number}</p>
                  {service.mileage && (
                    <p><span className="font-medium">Mileage:</span> {service.mileage.toLocaleString()} km</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{service.service_types.name}</p>
                    <p className="text-sm text-gray-600">Base service charge</p>
                  </div>
                  <p className="font-medium">₹{Number(service.service_types.base_price || 0).toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">Labor Charges</p>
                    <p className="text-sm text-gray-600">Additional labor and diagnostics</p>
                  </div>
                  <p className="font-medium">₹{Number(service.labor_charges || 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parts Used */}
          {service.service_parts && service.service_parts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Parts & Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Part Name</th>
                        <th className="text-left py-2">Part Number</th>
                        <th className="text-center py-2">Qty</th>
                        <th className="text-right py-2">Unit Price</th>
                        <th className="text-right py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {service.service_parts.map((part, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{part.spare_parts.part_name}</td>
                          <td className="py-2 text-sm text-gray-600">{part.spare_parts.part_number}</td>
                          <td className="py-2 text-center">{part.quantity}</td>
                          <td className="py-2 text-right">₹{Number(part.unit_price).toFixed(2)}</td>
                          <td className="py-2 text-right font-medium">₹{Number(part.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Notes */}
          {service.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Service Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{service.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Labor Charges:</span>
                  <span>₹{Number(service.labor_charges || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parts Total:</span>
                  <span>₹{totalPartsAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600 italic border-t pt-2">
                  <p><strong>Amount in Words:</strong> {numberToWords(grandTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Service */}
          {service.next_service_date && (
            <Card>
              <CardHeader>
                <CardTitle>Next Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Recommended next service date: <span className="font-medium">{service.next_service_date}</span></p>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t pt-6">
            <p>Thank you for choosing Shahi Multi Car Care!</p>
            <p>For any questions about this invoice, please contact Tohid Sayyad at +91 10838000313</p>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={handlePrint} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
