
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Receipt, Download } from 'lucide-react';
import { SaleWithItems } from '@/hooks/useSalesData';
import { numberToWords } from '@/utils/numberToWords';

interface SalesInvoiceProps {
  sale: SaleWithItems;
}

export const SalesInvoice = ({ sale }: SalesInvoiceProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

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
          <DialogTitle>Sales Invoice</DialogTitle>
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
              <p className="text-gray-600">#{sale.invoice_number}</p>
              <p className="text-sm text-gray-600">Date: {sale.sale_date}</p>
            </div>
          </div>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bill To:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-semibold">{sale.customer_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
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
                    {sale.sale_items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.spare_parts.part_name}</td>
                        <td className="py-2 text-sm text-gray-600">{item.spare_parts.part_number}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">₹{Number(item.unit_price).toFixed(2)}</td>
                        <td className="py-2 text-right font-medium">₹{Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Grand Total:</span>
                  <span>₹{Number(sale.total_amount).toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600 italic border-t pt-2">
                  <p><strong>Amount in Words:</strong> {numberToWords(Number(sale.total_amount))}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
