





"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Share2, Download, Printer, X, Loader2 } from "lucide-react";

// Fallback defaults
const DEFAULT_COMPANY = {
  name: "SHRI GARAGE",
  logo: "/miracle_logo.png",
  address1: "Plot No.5, Badnera Old Bypass",
  address2: "Dastur Nagar, Amravati - 444605",
  mobile: "+91 7213247374",
  email: "info@shrigarage.in",
  website: "www.shrigarage.com",
  prefix: "MC",
  terms: [
    "Warranty is void if the seal is broken or tampered with.",
    "Goods once sold will not be returned.",
    "Subject to Amravati Jurisdiction only.",
    "Interest @24% p.a. will be charged if bill not paid on due date."
  ]
};

const EstimationModal = ({ isOpen, onClose, jobCardId, jobDetails, estimationData }) => {
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    subTotal: 0,
    tax: 0,
    discount: 0,
    grandTotal: 0,
    advance: 0,
    balance: 0
  });
  const printRef = useRef();

  // Combine all items (jobs, oils, spares) without aggregation
  const allItems = useMemo(() => {
    if (!estimation) return [];
    
    const combinedItems = [
      ...(estimation.jobs || []),
      ...(estimation.oils || []),
      ...(estimation.spares || [])
    ];

    return combinedItems.map((item) => {
      const name = item.item_name || item.job_name || "Item";
      const rate = parseFloat(item.rate || 0);
      const parsedQty = parseFloat(item.quantity);
      const quantity = isNaN(parsedQty) ? 1 : parsedQty;

      let amount = parseFloat(item.amount);
      if (isNaN(amount)) {
        amount = quantity * rate;
      }

      return {
        ...item,
        item_name: name,
        rate,
        quantity,
        amount
      };
    });
  }, [estimation]);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Handle Direct Data (Washing Jobs / Quotations)
    if (jobDetails) {
      setLoading(true);
      try {
        const mappedData = {
          ...jobDetails,
          // Map fields to match modal expectations
          vehicle_model: jobDetails.model || jobDetails.vehicle_model,
          reminder_1: jobDetails.remind_period || jobDetails.reminder_1,
          advanceAmount: jobDetails.advance_amount || jobDetails.advanceAmount || 0,
          discountAmount: jobDetails.discount_amount || jobDetails.discountAmount || 0,
          // Map items if provided via estimationData, else use jobDetails.jobs
          jobs: estimationData?.services?.map(s => ({
            item_name: s.service,
            quantity: s.quantity,
            rate: s.rate,
            amount: s.amount
          })) || jobDetails.jobs || [],
          oils: jobDetails.oils || [],
          spares: jobDetails.spares || [],
        };
        setEstimation(mappedData);

        // Calculate Totals
        const subTotal = estimationData?.total_amount || mappedData.total_amount || 0;
        const advance = parseFloat(mappedData.advanceAmount || 0);
        const discount = parseFloat(mappedData.discountAmount || 0);
        const grandTotal = subTotal - discount;

        setTotals({ subTotal, tax: 0, discount, grandTotal, advance, balance: grandTotal - advance });
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Fetch Data by ID (Regular Job Cards)
    if (!jobCardId) return;
    const fetchEstimation = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobcards/${jobCardId}`
        );

        if (res.data.success) {
          const data = res.data.data;
          setEstimation(data);

          const itemsForTotal = [
            ...(data.jobs || []),
            ...(data.oils || []),
            ...(data.spares || [])
          ];

          const calculatedSubTotal = itemsForTotal.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
          
          const subTotal = calculatedSubTotal;
          const advance = parseFloat(data.advanceAmount) || 0;
          const discount = parseFloat(data.discountAmount) || 0;
          const grandTotal = subTotal - discount;
          
          setTotals({
            subTotal: subTotal,
            tax: 0,
            discount: discount,
            grandTotal: grandTotal,
            advance: advance,
            balance: grandTotal - advance
          });
        } else {
          setError("No estimation found.");
        }
      } catch (error) {
        const msg = axios.isAxiosError(error) ? error.response?.data?.message : error.message;
        setError(`Error: ${msg || "Failed to load"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimation();
  }, [isOpen, jobCardId, jobDetails, estimationData]);

  /* ---------------- HELPERS ---------------- */
  const getCompany = (field) => {
    if (estimation?.company && estimation.company[field]) {
      return estimation.company[field];
    }
    return DEFAULT_COMPANY[field];
  };

  const getCustomerName = () => estimation?.customer_name || estimation?.customerName || "Unknown Customer";
  const getMobile = () => estimation?.mobile_number || estimation?.mobileNumber || "N/A";
  const getVehicleNo = () => estimation?.vehicle_no || estimation?.vehicleNo || estimation?.vehicle_number || "N/A";
  const getModel = () => estimation?.vehicle_model || estimation?.vehicleModel || estimation?.model || "";
  const getMake = () => estimation?.make || estimation?.makeName || "";
  const getKm = () => estimation?.km_reading || estimation?.runningKm || estimation?.running_km || "0";
  const getServiceType = () => estimation?.service_option || estimation?.serviceOption || "Standard";
  const getPaymentMode = () => estimation?.payment_mode || estimation?.paymentMode || "Cash";
  const getStatus = () => estimation?.status || "Pending";

  const formatDate = (d) => {
    if(!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDateTime = (d) => {
    if(!d) return "-";
    return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  };

  /* ---------------- PDF GENERATION ---------------- */
  const generateCanvas = async () => {
    if (!printRef.current) return null;
    const original = printRef.current;
    const clone = original.cloneNode(true);

    // ✅ FIX 1: Allow height to be auto so it captures everything
    Object.assign(clone.style, {
        width: '794px', 
        minHeight: '1123px', 
        height: 'auto', // Changed from fixed 1123px to auto
        position: 'absolute',
        top: '-9999px', left: '-9999px', zIndex: '-1',
        background: '#ffffff', display: 'block', transform: 'none' 
    });
    
    document.body.appendChild(clone);
    // Wait for images to render
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
        const canvas = await html2canvas(clone, { scale: 2, useCORS: true, allowTaint: true, windowWidth: 794, scrollY: 0 });
        document.body.removeChild(clone);
        return canvas;
    } catch (err) {
        if (document.body.contains(clone)) document.body.removeChild(clone);
        return null;
    }
  };

  const downloadInvoiceAsPdf = async () => {
    setGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Canvas failed");
      const imgData = canvas.toDataURL("image/png");
      
      // ✅ FIX 2: Create a Dynamic Height PDF
      // A4 width is 210mm. We calculate height based on the image aspect ratio.
      const imgWidth = 210; 
      const pageHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Initialize PDF with dynamic height to fit long content
      const pdf = new jsPDF("p", "mm", [imgWidth, pageHeight]);
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, pageHeight);
      
      const safeName = getCustomerName().replace(/\s+/g, "_");
      pdf.save(`Invoice_${estimation?.id || 'Doc'}_${safeName}.pdf`);
    } catch (err) { alert("Could not generate PDF."); } finally { setGenerating(false); }
  };

  const handleSharePdf = async () => {
    setGenerating(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Canvas failed");
      const imgData = canvas.toDataURL("image/png");
      
      // Dynamic height for shared PDF too
      const imgWidth = 210; 
      const pageHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", [imgWidth, pageHeight]);
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, pageHeight);
      const pdfBlob = pdf.output("blob");
      
      const safeName = getCustomerName().replace(/\s+/g, "_");
      const file = new File([pdfBlob], `${safeName}.pdf`, { type: "application/pdf" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Invoice', text: `Invoice for ${getCustomerName()}` });
      } else { downloadInvoiceAsPdf(); }
    } catch (err) { if (err.name !== 'AbortError') alert("Failed to share."); } finally { setGenerating(false); }
  };

  const handlePrint = () => window.print();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-start md:items-center overflow-y-auto p-2 sm:p-4 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative flex flex-col max-h-[95vh] print:max-w-none print:max-h-none print:shadow-none print:rounded-none">

        {/* Modal Header */}
        <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-xl print:hidden sticky top-0 z-20">
          <h2 className="text-lg font-semibold text-gray-700">Invoice Preview</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full text-gray-500 hover:text-red-600 transition-colors"><X size={20} /></button>
        </div>

        {loading && <div className="flex-grow flex flex-col justify-center items-center gap-3 min-h-[400px]"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /><p className="text-gray-500 text-sm">Fetching Data...</p></div>}
        {!loading && error && <div className="p-10 text-center"><p className="text-red-500 font-medium mb-2">{error}</p><button onClick={onClose} className="text-blue-600 hover:underline">Close</button></div>}

        {!loading && estimation && (
          <div className="flex-grow overflow-y-auto bg-gray-100 p-2 sm:p-6 print:p-0 print:overflow-visible">
            
            {/* ✅ FIX 3: Styling Change
                - Removed fixed `height: 1123px`
                - Changed to `height: auto` so it grows
                - Kept `minHeight: 1123px` so short invoices still look full page
            */}
            <div 
                ref={printRef} 
                className="bg-white mx-auto shadow-sm print:shadow-none w-full max-w-3xl flex flex-col origin-top transform md:transform-none scale-[0.45] sm:scale-[0.6] md:scale-100" 
                style={{ 
                    width: '794px', 
                    minHeight: '1123px', 
                    height: 'auto', // Allow growth
                    paddingBottom: '40px' // Add padding at bottom
                }}
            >
                
                {/* 1. HEADER */}
                <div className="bg-[#1e293b]">
                    <div className="bg-[#1e293b] text-white p-8 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="bg-white p-1 rounded w-12 h-12 relative flex-shrink-0">
                                    <Image src={getCompany('logo')} alt="Logo" layout="fill" objectFit="contain" unoptimized />
                                </div>
                                <h1 className="text-3xl font-bold tracking-widest uppercase">{getCompany('name')}</h1>
                            </div>
                            <div className="text-slate-300 text-xs leading-relaxed space-y-0.5">
                                <p>{getCompany('address1')}</p>
                                <p>{getCompany('address2')}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-5xl font-bold text-slate-100 opacity-10 absolute top-6 right-8 pointer-events-none">INVOICE</h2>
                            <div className="relative z-10 mt-2">
                                <div className="mb-2">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">Invoice No</p>
                                    <p className="text-xl font-bold">#{getCompany('prefix')}-{new Date().getFullYear()}-{estimation.id?.toString().padStart(4, '0')}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] uppercase tracking-wider">Date</p>
                                    <p className="text-sm font-medium">{formatDate(new Date())}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=" px-8 py-2 flex justify-between text-[11px] text-white border-b border-slate-200">
                        <span className="flex items-center gap-1">📞 {getCompany('mobile')}</span>
                        <span className="flex items-center gap-1">✉️ {getCompany('email')}</span>
                        <span className="flex items-center gap-1">🌐 {getCompany('website')}</span>
                    </div>
                </div>

                {/* 2. CUSTOMER & VEHICLE GRID */}
                <div className="p-8 grid grid-cols-2 gap-12 border-b border-slate-100">
                    {/* Customer - Using Accessors */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">Bill To</h3>
                        <p className="text-lg font-bold text-slate-800 capitalize">{getCustomerName()}</p>
                        <p className="text-sm text-slate-600 mt-1">📱 {getMobile()}</p>
                        <div className="mt-4 flex gap-2">
                             <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getStatus().toLowerCase() === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                {getStatus()}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-2 py-1 rounded border bg-slate-50 text-slate-700 border-slate-200">
                                {getPaymentMode()}
                            </span>
                        </div>
                    </div>

                    {/* Vehicle - Using Accessors */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">Vehicle Info</h3>
                        <table className="w-full text-sm text-slate-700">
                            <tbody>
                                <tr>
                                    <td className="py-1 text-slate-500 w-24">Reg. No:</td>
                                    <td className="py-1 font-bold uppercase">{getVehicleNo()}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 text-slate-500">Make/Model:</td>
                                    <td className="py-1 capitalize font-medium">{getMake()} {getModel()}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 text-slate-500">Odometer:</td>
                                    <td className="py-1">{getKm()} KM</td>
                                </tr>
                                <tr>
                                    <td className="py-1 text-slate-500">Type:</td>
                                    <td className="py-1 capitalize">{getServiceType()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. DYNAMIC JOB SCHEDULE */}
                <div className="px-8 py-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Job Schedule</h3>
                    <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                            <p className="text-slate-500 mb-0.5">Created On</p>
                            <p className="font-semibold text-slate-800">{formatDateTime(estimation.created_at || estimation.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 mb-0.5">Delivery Time</p>
                            <p className="font-semibold text-slate-800">
                                {(estimation.delivery_date || estimation.deliveryDate) ? formatDate(estimation.delivery_date || estimation.deliveryDate) : "N/A"} 
                                {(estimation.delivery_time || estimation.deliveryTime) ? ` @ ${estimation.delivery_time || estimation.deliveryTime}` : ""}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500 mb-0.5">Completion</p>
                            <p className="font-semibold text-slate-800">
                                {(estimation.completion_datetime || estimation.completionDateTime) ? formatDateTime(estimation.completion_datetime || estimation.completionDateTime) : "Pending"}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500 mb-0.5">Next Reminder</p>
                            <p className="font-semibold text-slate-800">
                                {(estimation.reminder_1 || estimation.remind_period) ? formatDate(estimation.reminder_1 || estimation.remind_period) : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4. ITEM TABLE */}
                <div className="px-8 mt-6 mb-6 flex-grow">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                                <th className="py-3 px-4 text-left w-14 rounded-tl-md rounded-bl-md">#</th>
                                <th className="py-3 px-4 text-left">Description</th>
                                <th className="py-3 px-4 text-center w-20">Qty</th>
                                <th className="py-3 px-4 text-right w-28">Rate</th>
                                <th className="py-3 px-4 text-right w-32 rounded-tr-md rounded-br-md">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {allItems && allItems.length > 0 ? (
                                allItems.map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
                                        <td className="py-3 px-4 font-medium text-slate-800">{item.item_name}</td>
                                        <td className="py-3 px-4 text-center">{item.quantity}</td>
                                        <td className="py-3 px-4 text-right text-slate-500">₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-800">₹{parseFloat(item.amount || 0).toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-b border-slate-100">
                                    <td className="py-8 text-center text-slate-400 italic" colSpan="5">No items added to this job card.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 5. TOTALS */}
                <div className="px-8 flex justify-end mb-12 mt-auto">
                    <div className="w-72">
                        {/* <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
                            <span>Sub Total</span>
                            <span>₹ {totals.subTotal.toFixed(2)}</span>
                        </div> */}
                        
                        {totals.discount > 0 && (
                            <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
                                <span>Discount</span>
                                <span>- ₹ {totals.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
                            <span>Advance Paid</span>
                            <span>₹ {(totals.advance || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 text-sm text-slate-800 font-bold">
                            <span>Balance Due</span>
                            <span>₹ {(totals.balance || 0).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between py-3 text-xl font-bold text-slate-900 border-b-2 border-slate-800">
                            <span>Total</span>
                            <span>₹ {totals.grandTotal.toFixed(2)}</span>
                        </div>
                        
                    </div>
                </div>

                {/* 6. FOOTER */}
                <div className="px-8 pb-8">
                    <div className="flex justify-between items-end gap-8 mb-6">
                        <div className="text-xs text-slate-500 max-w-sm">
                            <p className="font-bold text-slate-700 mb-2 uppercase tracking-wide">Terms & Conditions:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                {(getCompany('terms') || []).map((term, i) => (
                                    <li key={i}>{term}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-center">
                            <div className="h-16 w-40 border-b border-slate-400 mb-2"></div>
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Authorised Signatory</p>
                        </div>
                    </div>
                    <div className="border-t-2 border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider">
                        <p>Thank you for your business!</p>
                        <p>System Generated • {getCompany('name')}</p>
                    </div>
                </div>

            </div>
          </div>
        )}

        <div className="border-t p-3 bg-white flex flex-col sm:flex-row gap-3 justify-end sticky bottom-0 z-20 print:hidden">
            <button onClick={downloadInvoiceAsPdf} disabled={generating} className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-sm flex justify-center items-center gap-2 text-sm font-medium transition-all disabled:opacity-70 disabled:cursor-wait">
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {generating ? "Processing..." : "Download PDF"}
            </button>
            <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={handlePrint} className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm flex justify-center items-center gap-2 text-sm font-medium transition-all"><Printer size={16} /> Print</button>
                <button onClick={handleSharePdf} disabled={generating} className="flex-1 sm:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm flex justify-center items-center gap-2 text-sm font-medium transition-all disabled:opacity-70">{generating ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />} Share</button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default EstimationModal;