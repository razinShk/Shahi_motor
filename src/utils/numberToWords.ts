
export const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertHundreds = (n: number): string => {
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result;
  };
  
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = '';
  let crores = Math.floor(integerPart / 10000000);
  let lakhs = Math.floor((integerPart % 10000000) / 100000);
  let thousandsPart = Math.floor((integerPart % 100000) / 1000);
  let hundreds = integerPart % 1000;
  
  if (crores > 0) {
    result += convertHundreds(crores) + 'Crore ';
  }
  
  if (lakhs > 0) {
    result += convertHundreds(lakhs) + 'Lakh ';
  }
  
  if (thousandsPart > 0) {
    result += convertHundreds(thousandsPart) + 'Thousand ';
  }
  
  if (hundreds > 0) {
    result += convertHundreds(hundreds);
  }
  
  result += 'Rupees';
  
  if (decimalPart > 0) {
    result += ' and ' + convertHundreds(decimalPart) + 'Paise';
  }
  
  return result.trim() + ' Only';
};
