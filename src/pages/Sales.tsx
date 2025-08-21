import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import { useSalesData, useCreateSale } from '@/hooks/useSalesData';
import { useSparePartsData } from '@/hooks/useSparePartsData';
import { useToast } from '@/hooks/use-toast';
import { SalesInvoice } from '@/components/SalesInvoice';

const Sales = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateSaleOpen, setIsCreateSaleOpen] = useState(false);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [newSale, setNewSale] = useState({
    customer_name: '',
    invoice_number: '',
  });

  const { data: sales, isLoading } = useSalesData();
  const { data: spareParts } = useSparePartsData();
  const createSaleMutation = useCreateSale();

  const filteredSales = sales?.filter(sale =>
    sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToSale = () => {
    setSaleItems([...saleItems, {
      spare_part_id: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
    }]);
  };

  const removeItemFromSale = (index: number) => {
    const updatedItems = saleItems.filter((_, i) => i !== index);
    setSaleItems(updatedItems);
  };

  const updateSaleItem = (index: number, field: string, value: any) => {
    const updatedItems = [...saleItems];
    updatedItems[index][field] = value;
    
    if (field === 'spare_part_id') {
      const selectedPart = spareParts?.find(part => part.id === value);
      if (selectedPart) {
        updatedItems[index].unit_price = selectedPart.price;
        updatedItems[index].subtotal = selectedPart.price * updatedItems[index].quantity;
      }
    }
    
    if (field === 'quantity') {
      updatedItems[index].subtotal = updatedItems[index].unit_price * value;
    }
    
    setSaleItems(updatedItems);
  };

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleCreateSale = async () => {
    if (!newSale.customer_name || !newSale.invoice_number || saleItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one item",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSaleMutation.mutateAsync({
        sale: {
          customer_name: newSale.customer_name,
          invoice_number: newSale.invoice_number,
          total_amount: getTotalAmount(),
        },
        items: saleItems,
      });

      setNewSale({ customer_name: '', invoice_number: '' });
      setSaleItems([]);
      setIsCreateSaleOpen(false);

      toast({
        title: "Success",
        description: "Sale recorded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive",
      });
    }
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-4);
    return `INV-${year}${month}${day}-${time}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Management</h1>
          <p className="text-gray-600">Record and track spare parts sales</p>
        </div>
        
        <Dialog open={isCreateSaleOpen} onOpenChange={setIsCreateSaleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Sale Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={newSale.customer_name}
                    onChange={(e) => setNewSale({ ...newSale, customer_name: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="invoice_number">Invoice Number</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="invoice_number"
                      value={newSale.invoice_number}
                      onChange={(e) => setNewSale({ ...newSale, invoice_number: e.target.value })}
                      placeholder="Enter invoice number"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewSale({ ...newSale, invoice_number: generateInvoiceNumber() })}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sale Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Sale Items</Label>
                  <Button type="button" variant="outline" onClick={addItemToSale}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {saleItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                      <div className="col-span-4">
                        <Label>Part</Label>
                        <Select
                          value={item.spare_part_id}
                          onValueChange={(value) => updateSaleItem(index, 'spare_part_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select part" />
                          </SelectTrigger>
                          <SelectContent>
                            {spareParts?.filter(part => part.quantity_in_stock > 0).map((part) => (
                              <SelectItem key={part.id} value={part.id}>
                                {part.part_name} - ₹{part.price} (Stock: {part.quantity_in_stock})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateSaleItem(index, 'unit_price', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Subtotal</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.subtotal}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="col-span-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItemFromSale(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {saleItems.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-xl font-bold">₹{getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleCreateSale} className="w-full" disabled={createSaleMutation.isPending}>
                {createSaleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                Record Sale
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by customer name or invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History ({filteredSales?.length || 0} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                  <TableCell>{sale.customer_name}</TableCell>
                  <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {sale.sale_items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          {item.spare_parts.part_name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₹{sale.total_amount}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {sale.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <SalesInvoice sale={sale} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
