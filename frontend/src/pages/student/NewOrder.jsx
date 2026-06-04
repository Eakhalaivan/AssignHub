import { useCallback, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { useCreateOrder } from '../../hooks/useOrders';
import { useAuthStore } from '../../store/authStore';
import { PaymentGateway } from '../../components/common/PaymentGateway';
import { getPricing } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
import TopNav from '../../components/common/TopNav';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../animations/presets';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import api from '../../api/axios';
import RadarScannerMap from '../../components/common/RadarScannerMap';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  FileText, 
  UploadCloud, 
  Trash2, 
  Calendar,
  FileCheck,
  CreditCard,
  Percent
} from 'lucide-react';

const SERVICES = [
  'Assignment', 'Record Note', 'Observation Record', 'Lab Manual', 'Diagram', 'Model',
  'Mini Project', 'Seminar PPT', 'Project Documentation', 'Final Year Project',
  'Hardware Project', 'Software Project', 'IoT Project', 'AI/ML Project'
];

const ACADEMIC_LEVELS = ['School', 'Diploma', 'UG', 'PG'];
const OUTPUT_MEDIUMS = ['Typed', 'Printed', 'Handwritten'];
const DIAGRAM_COMPLEXITIES = ['Simple', 'Technical', 'Engineering'];
const MODEL_TYPES = ['Chart Model', 'Working Model', 'Science Exhibition Model', 'Engineering Model', 'None'];
const PRINTING_TYPES = ['Black & White', 'Color', 'None'];
const BINDING_TYPES = ['None', 'Spiral Binding', 'Hard Binding'];
const PRIORITIES = ['Normal', 'Priority', 'Urgent', 'Same Day', 'Express'];

const orderSchema = z.object({
  title: z.string().min(5, 'Title must contain at least 5 characters.').max(100, 'Title maximum exceeded'),
  serviceType: z.string().min(1, 'Service type is required'),
  academicLevel: z.enum(['School', 'Diploma', 'UG', 'PG']),
  description: z.string().min(10, 'Requirements spec must contain at least 10 characters.'),
  pages: z.preprocess((val) => (val === '' || val === null || val === undefined) ? 1 : Number(val), z.number().min(1, 'Target pages count must be at least 1').max(500, 'Page count maximum exceeded')),
  deadline: z.string().min(1, 'Please specify deadline timestamp'),
  deliveryPriority: z.enum(['Normal', 'Priority', 'Urgent', 'Same Day', 'Express']),
  outputMedium: z.enum(['Typed', 'Printed', 'Handwritten']),
  diagramsCount: z.preprocess((val) => (val === '' || val === null || val === undefined) ? 0 : Number(val), z.number().min(0, 'Diagrams count must be non-negative')),
  diagramComplexity: z.enum(['Simple', 'Technical', 'Engineering']),
  colorDiagrams: z.boolean(),
  materialCost: z.preprocess((val) => (val === '' || val === null || val === undefined) ? 0 : Number(val), z.number().min(0, 'Material costs must be non-negative')),
  hardwareComponentsCost: z.preprocess((val) => (val === '' || val === null || val === undefined) ? 0 : Number(val), z.number().min(0, 'Hardware cost must be non-negative')),
  modelType: z.enum(['Chart Model', 'Working Model', 'Science Exhibition Model', 'Engineering Model', 'None']),
  printingType: z.enum(['Black & White', 'Color', 'None']),
  bindingType: z.enum(['None', 'Spiral Binding', 'Hard Binding']),
  subject: z.string().min(2, 'Subject domain is required'),
  locationRadiusKm: z.preprocess((val) => (val === '' || val === null || val === undefined) ? 5.0 : Number(val), z.number().min(1).max(30)),
});

const STEPS = [
  { num: 1, label: 'Task Details' },
  { num: 2, label: 'Instructions' },
  { num: 3, label: 'Files' },
  { num: 4, label: 'Deadline & Priority' },
  { num: 5, label: 'Pricing Review' },
  { num: 6, label: 'Payment' }
];

const getTomorrowDateTimeString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const hh = String(tomorrow.getHours()).padStart(2, '0');
  const min = String(tomorrow.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const mapServiceToOrderType = (service) => {
  switch (service) {
    case 'Record Note': return 'RECORD_NOTE';
    case 'Observation Record': return 'OBSERVATION';
    case 'Assignment': return 'ASSIGNMENT';
    case 'Seminar PPT': return 'ASSIGNMENT';
    case 'Lab Manual': return 'LAB_MANUAL';
    case 'Diagram': return 'DIAGRAM';
    case 'Model': return 'MODEL';
    case 'Mini Project': return 'MINI_PROJECT';
    case 'Project Documentation': return 'FINAL_YEAR_PROJECT';
    case 'Final Year Project': return 'FINAL_YEAR_PROJECT';
    case 'Hardware Project': return 'FINAL_YEAR_PROJECT';
    case 'Software Project': return 'FINAL_YEAR_PROJECT';
    case 'IoT Project': return 'FINAL_YEAR_PROJECT';
    case 'AI/ML Project': return 'FINAL_YEAR_PROJECT';
    default: return 'ASSIGNMENT';
  }
};

const mapPriorityToUrgency = (priority) => {
  switch (priority) {
    case 'Normal': return 'NORMAL';
    case 'Priority': return 'NORMAL';
    case 'Urgent': return 'URGENT';
    case 'Same Day': return 'SAME_DAY';
    case 'Express': return 'SAME_DAY';
    default: return 'NORMAL';
  }
};

const mapMediumToWorkType = (medium) => {
  switch (medium) {
    case 'Handwritten': return 'HANDWRITTEN';
    case 'Typed': return 'TYPED';
    case 'Printed': return 'PRINTED';
    default: return 'TYPED';
  }
};

const formatINR = (num) => {
  return Math.round(num || 0).toLocaleString('en-IN');
};

const calculateQuote = (values) => {
  if (!values) return { grandTotal: 0 };
  const service = values.serviceType;
  const level = values.academicLevel || 'UG';
  const pages = Number(values.pages) || 1;
  const medium = values.outputMedium || 'Typed';
  const diagramsCount = Number(values.diagramsCount) || 0;
  const diagramComplexity = values.diagramComplexity || 'Simple';
  const colorDiagrams = values.colorDiagrams || false;
  const materialCost = Number(values.materialCost) || 0;
  const hardwareComponentsCost = Number(values.hardwareComponentsCost) || 0;
  const modelType = values.modelType || 'None';
  const printingType = values.printingType || 'None';
  const bindingType = values.bindingType || 'None';
  const deliveryPriority = values.deliveryPriority || 'Normal';
  // Delivery charge removed — no longer part of any calculation
  // Platform fee is admin-only; read from localStorage (fallback 15%)
  const commissionPercent = Number(localStorage.getItem('adminPlatformFee')) || 15;

  let basePrice = 0;
  
  // Base Service Cost
  if (service === 'Model') {
    if (modelType === 'Chart Model') basePrice = 1000;
    else if (modelType === 'Working Model') basePrice = 5750;
    else if (modelType === 'Science Exhibition Model') basePrice = 11000;
    else if (modelType === 'Engineering Model') basePrice = 27500;
    else basePrice = 1000;
  } else if (service === 'Mini Project') {
    if (level === 'School') basePrice = 1250;
    else if (level === 'Diploma') basePrice = 3250;
    else if (level === 'UG') basePrice = 6500;
    else if (level === 'PG') basePrice = 12500;
  } else if (service === 'Project Documentation') {
    basePrice = 6500;
  } else if (service === 'Software Project') {
    basePrice = 22500;
  } else if (service === 'Hardware Project') {
    basePrice = 41500;
  } else if (service === 'IoT Project') {
    basePrice = 45000;
  } else if (service === 'AI/ML Project') {
    basePrice = 57500;
  } else if (service === 'Final Year Project') {
    basePrice = 6500;
  }

  // Page Writing Cost
  let pageWritingRate = 50;
  if (medium === 'Printed') pageWritingRate = 75;
  else if (medium === 'Handwritten') pageWritingRate = 115;
  const pageWritingCost = pages * pageWritingRate;

  // Diagram Cost
  let diagramRate = 75;
  if (diagramComplexity === 'Technical') diagramRate = 175;
  else if (diagramComplexity === 'Engineering') diagramRate = 350;
  let diagramCost = diagramsCount * diagramRate;
  if (colorDiagrams) diagramCost = diagramCost * 1.5;

  // Hardware Cost
  const hardwareCost = hardwareComponentsCost * 1.30;

  // Printing Cost
  let printingRate = 0;
  if (printingType === 'Black & White') printingRate = 3.50;
  else if (printingType === 'Color') printingRate = 20;
  const printingCost = pages * printingRate;

  // Binding Cost
  let bindingCost = 0;
  if (bindingType === 'Spiral Binding') bindingCost = 100;
  else if (bindingType === 'Hard Binding') bindingCost = 400;

  // Subtotal (no delivery charge)
  const subtotal = basePrice + pageWritingCost + diagramCost + materialCost + hardwareCost + printingCost + bindingCost;

  // Priority surcharge
  let priorityPercent = 0;
  if (deliveryPriority === 'Priority') priorityPercent = 0.25;
  else if (deliveryPriority === 'Urgent') priorityPercent = 0.50;
  else if (deliveryPriority === 'Same Day') priorityPercent = 0.75;
  else if (deliveryPriority === 'Express') priorityPercent = 1.00;
  
  const prioritySurcharge = subtotal * priorityPercent;

  // Platform commission (silently baked into grand total — not shown to student)
  const platformCommission = (subtotal + prioritySurcharge) * (commissionPercent / 100);

  // Grand Total already includes platform fee
  const grandTotal = subtotal + prioritySurcharge + platformCommission;

  // Internal payout summary (admin-only)
  const writerPayout = grandTotal - platformCommission;
  const platformProfit = platformCommission;

  return {
    basePrice,
    pageWritingCost,
    pageWritingRate,
    diagramCost,
    diagramRate,
    hardwareCost,
    printingCost,
    printingRate,
    bindingCost,
    subtotal,
    priorityPercent,
    prioritySurcharge,
    platformCommission,
    grandTotal,
    writerPayout,
    platformProfit,
  };
};

const generateQuoteText = (values, quote) => {
  const lines = [];
  lines.push("╔══════════════════════════════════════════╗");
  lines.push("       STUDENT PROJECT QUOTATION       ");
  lines.push("╚══════════════════════════════════════════╝");
  lines.push("");
  lines.push("SERVICE DETAILS");
  lines.push("───────────────────────────────────────────");
  lines.push(`Service Type      : ${values.serviceType}`);
  lines.push(`Academic Level    : ${values.academicLevel}`);
  lines.push(`Output Medium     : ${values.outputMedium}`);
  lines.push(`Delivery Priority : ${values.deliveryPriority}`);
  lines.push("");
  lines.push("COST BREAKDOWN");
  lines.push("───────────────────────────────────────────");
  
  if (quote.basePrice > 0) {
    lines.push(`Base Service Cost       : ₹${formatINR(quote.basePrice)}`);
  }
  if (quote.pageWritingCost > 0) {
    lines.push(`Page Writing Cost       : ₹${formatINR(quote.pageWritingCost)} (${values.pages} pages × ₹${quote.pageWritingRate}/page)`);
  }
  if (quote.diagramCost > 0) {
    const isColorText = values.colorDiagrams ? " color" : "";
    lines.push(`Diagram Cost            : ₹${formatINR(quote.diagramCost)} (${values.diagramsCount}${isColorText} diagrams × ₹${quote.diagramRate} each${values.colorDiagrams ? ' + 50%' : ''})`);
  }
  if (Number(values.materialCost) > 0) {
    lines.push(`Material Cost           : ₹${formatINR(values.materialCost)}`);
  }
  if (quote.hardwareCost > 0) {
    lines.push(`Hardware Cost (×1.30)   : ₹${formatINR(quote.hardwareCost)}`);
  }
  if (quote.printingCost > 0) {
    lines.push(`Printing Cost           : ₹${formatINR(quote.printingCost)} (${values.pages} pages × ₹${quote.printingRate}/page)`);
  }
  if (quote.bindingCost > 0) {
    lines.push(`Binding Cost            : ₹${formatINR(quote.bindingCost)}`);
  }
  // Delivery charge removed — no longer part of any quotation
  
  lines.push("───────────────────────────────────────────");
  lines.push(`Subtotal                : ₹${formatINR(quote.subtotal)}`);
  lines.push("");
  
  if (quote.prioritySurcharge > 0) {
    lines.push(`Priority Surcharge (+${quote.priorityPercent * 100}%): ₹${formatINR(quote.prioritySurcharge)}`);
  }
  // Platform commission is baked into the grand total silently (admin-controlled)
  
  lines.push("───────────────────────────────────────────");
  lines.push(`TOTAL                   : ₹${formatINR(quote.grandTotal)}`);
  lines.push("");
  
  let deliveryTimeframe = "5–7 Days";
  if (values.deliveryPriority === 'Priority') deliveryTimeframe = "3 Days";
  else if (values.deliveryPriority === 'Urgent') deliveryTimeframe = "24 Hours";
  else if (values.deliveryPriority === 'Same Day') deliveryTimeframe = "Same Day";
  else if (values.deliveryPriority === 'Express') deliveryTimeframe = "6 Hours";
  
  lines.push(`DELIVERY ESTIMATE       : ${deliveryTimeframe}`);
  lines.push("");
  lines.push("* Prices are midpoint estimates. Final quote may vary based on complexity.");
  
  return lines.join("\n");
};

const MOCK_WRITERS = [
  {
    id: 1, name: "Priya S.", fullName: "Priya Subramaniam",
    rating: 4.9, reviewCount: 128,
    spec: "UG Projects, Lab Manuals",
    services: ["Assignments", "Lab Manuals", "Record Notes", "UG Projects", "Seminar PPT"],
    status: "available",
    angle: 45, dist: 0.35,
    ordersCompleted: 342, onTimeRate: 97, repeatClients: 84,
    distance: "1.2 km", responseTime: "~10 mins", availableDays: "Mon–Sat, 9AM–9PM",
    bio: "Experienced academic writer with 4+ years helping UG students across engineering and science streams. Specialises in neat handwritten records and structured lab manuals.",
    reviews: [
      { reviewer: "Arjun K.", stars: 5, text: "Delivered my lab manual 2 days early. Very neat handwriting!", date: "2 days ago" },
      { reviewer: "Sneha M.", stars: 5, text: "Excellent quality assignment. Will definitely request again.", date: "1 week ago" }
    ]
  },
  {
    id: 2, name: "Arjun M.", fullName: "Arjun Murugan",
    rating: 4.7, reviewCount: 89,
    spec: "Assignments, Record Notes",
    services: ["Assignments", "Record Notes", "Observation Records", "Typed Docs"],
    status: "busy",
    angle: 120, dist: 0.55,
    ordersCompleted: 215, onTimeRate: 93, repeatClients: 71,
    distance: "2.8 km", responseTime: "~30 mins", availableDays: "Mon–Fri, 10AM–8PM",
    bio: "Passionate about clean, well-structured academic writing. Currently handling a few orders but accepting new requests for next-day delivery slots.",
    reviews: [
      { reviewer: "Divya T.", stars: 5, text: "Very professional. Completed my assignment overnight!", date: "3 days ago" },
      { reviewer: "Karthik R.", stars: 4, text: "Good quality, slight delay but communicated proactively.", date: "2 weeks ago" }
    ]
  },
  {
    id: 3, name: "Sneha R.", fullName: "Sneha Ramachandran",
    rating: 4.8, reviewCount: 203,
    spec: "Final Year Projects, PPT",
    services: ["Final Year Projects", "Seminar PPT", "Project Documentation", "Mini Projects"],
    status: "available",
    angle: 200, dist: 0.42,
    ordersCompleted: 178, onTimeRate: 98, repeatClients: 90,
    distance: "0.8 km", responseTime: "~5 mins", availableDays: "Every day, 8AM–10PM",
    bio: "Top-rated project documentation specialist. Helped over 170 students complete their final year projects with full documentation, PPTs and viva preparation notes.",
    reviews: [
      { reviewer: "Vijay P.", stars: 5, text: "My project report was absolutely perfect. 10/10!", date: "1 day ago" },
      { reviewer: "Meena K.", stars: 5, text: "Best PPT I have ever seen. She understood my topic immediately.", date: "5 days ago" }
    ]
  },
  {
    id: 4, name: "Karthik V.", fullName: "Karthik Venkatesh",
    rating: 4.6, reviewCount: 67,
    spec: "Hardware & IoT Projects",
    services: ["Hardware Projects", "IoT Projects", "AI/ML Projects", "Circuit Diagrams"],
    status: "available",
    angle: 290, dist: 0.68,
    ordersCompleted: 94, onTimeRate: 91, repeatClients: 78,
    distance: "3.5 km", responseTime: "~20 mins", availableDays: "Tue–Sun, 11AM–9PM",
    bio: "Electronics engineering graduate with hands-on experience building IoT prototypes and Arduino/Raspberry Pi projects. Provides complete hardware + documentation packages.",
    reviews: [
      { reviewer: "Rahul N.", stars: 5, text: "My IoT project worked perfectly on demo day. Brilliant!", date: "4 days ago" },
      { reviewer: "Priya S.", stars: 4, text: "Good hardware skills. Documentation could be more detailed.", date: "3 weeks ago" }
    ]
  },
  {
    id: 5, name: "Divya T.", fullName: "Divya Thangavel",
    rating: 4.5, reviewCount: 54,
    spec: "Diagrams, Lab Manuals",
    services: ["Diagrams", "Lab Manuals", "Observation Records", "Handwritten Notes"],
    status: "busy",
    angle: 155, dist: 0.28,
    ordersCompleted: 132, onTimeRate: 89, repeatClients: 65,
    distance: "1.9 km", responseTime: "~45 mins", availableDays: "Mon–Sat, 2PM–10PM",
    bio: "Specialises in neat engineering and science diagrams. Known for clean freehand technical illustrations and well-organised handwritten lab records.",
    reviews: [
      { reviewer: "Arjun M.", stars: 5, text: "The circuit diagrams were incredibly clean. Exactly what I needed.", date: "1 week ago" },
      { reviewer: "Sneha R.", stars: 4, text: "Good diagrams, took a little longer than expected.", date: "2 weeks ago" }
    ]
  },
  {
    id: 6, name: "Rahul N.", fullName: "Rahul Narayanan",
    rating: 4.9, reviewCount: 311,
    spec: "AI/ML Projects, Documentation",
    services: ["AI/ML Projects", "Software Projects", "Project Documentation", "Research Papers"],
    status: "available",
    angle: 330, dist: 0.75,
    ordersCompleted: 289, onTimeRate: 99, repeatClients: 92,
    distance: "4.1 km", responseTime: "~8 mins", availableDays: "Every day, 6AM–11PM",
    bio: "Machine learning engineer and academic writer with published research experience. Builds complete AI/ML project pipelines with full documentation, presentation, and viva Q&A prep.",
    reviews: [
      { reviewer: "Karthik V.", stars: 5, text: "My ML project got the highest marks in class. Absolutely incredible work!", date: "2 days ago" },
      { reviewer: "Divya T.", stars: 5, text: "Rahul went above and beyond. Highly recommended for any tech project.", date: "1 week ago" }
    ]
  },
  {
    id: 7, name: "Meena K.", fullName: "Meena Krishnaswamy",
    rating: 4.3, reviewCount: 41,
    spec: "School Assignments, Models",
    services: ["School Assignments", "Models", "Chart Work", "Handwritten Notes"],
    status: "offline",
    angle: 75, dist: 0.60,
    ordersCompleted: 76, onTimeRate: 85, repeatClients: 58,
    distance: "2.3 km", responseTime: "Usually next day", availableDays: "Mon–Fri, 3PM–8PM",
    bio: "Experienced in school-level assignments and creative working models. Especially good at science exhibition models and chart work for school fairs.",
    reviews: [
      { reviewer: "Vijay P.", stars: 4, text: "Nice working model. Helped my child a lot for the science fair.", date: "2 weeks ago" },
      { reviewer: "Rahul N.", stars: 4, text: "Decent quality, communication was a bit slow.", date: "1 month ago" }
    ]
  },
  {
    id: 8, name: "Vijay P.", fullName: "Vijay Prakash",
    rating: 4.7, reviewCount: 158,
    spec: "Software Projects, Mini Projects",
    services: ["Software Projects", "Mini Projects", "Seminar PPT", "Project Documentation"],
    status: "available",
    angle: 240, dist: 0.50,
    ordersCompleted: 201, onTimeRate: 95, repeatClients: 80,
    distance: "2.0 km", responseTime: "~15 mins", availableDays: "Mon–Sun, 9AM–9PM",
    bio: "Full-stack developer and academic project writer. Delivers complete software projects with source code, documentation, and presentation. Supports Java, Python, PHP, and web tech stacks.",
    reviews: [
      { reviewer: "Meena K.", stars: 5, text: "My mini project was delivered with full explanation. Fantastic!", date: "3 days ago" },
      { reviewer: "Priya S.", stars: 5, text: "Clean code and well-structured report. Very satisfied.", date: "1 week ago" }
    ]
  }
];

export default function NewOrder() {
  const navigate = useNavigate();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const [files, setFiles] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedWriter, setSelectedWriter] = useState(null);

  // Location permission persistence: skip popup if previously decided
  const locationDecision = localStorage.getItem('locationPermissionDecision'); // 'granted'|'denied'|'skipped'
  const [showLocationModal, setShowLocationModal] = useState(!locationDecision);
  const [isDemoMode, setIsDemoMode] = useState(locationDecision !== 'granted');
  const [userCenter, setUserCenter] = useState({ lat: 13.0827, lng: 80.2707 });
  const [locationError, setLocationError] = useState(null);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' | 'card'
  const { user } = useAuthStore();
  const [stripeError, setStripeError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isOrderPreCreating, setIsOrderPreCreating] = useState(false);
  const [paymentState, setPaymentState] = useState('idle'); // 'idle' | 'success' | 'error'

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      await api.post(`/orders/${createdOrder.id}/paid`, {
        stripePaymentIntentId: paymentIntent.id,
        amountPaid: paymentIntent.amount / 100
      });

      setPaymentState('success');

      setTimeout(() => {
        navigate('/student/orders');
      }, 2000);
    } catch (err) {
      console.error('Failed to update payment status:', err);
      toast.error('Payment was successful, but server registration failed. Please contact support.');
    }
  };

  const handlePaymentError = (errorMessage) => {
    setStripeError(errorMessage);
    setPaymentState('error');
  };

  const ensureOrderCreated = async () => {
    if (createdOrder) return createdOrder;

    setIsOrderPreCreating(true);
    try {
      // 1. Upload files first if any
      let fileUrls = '';
      if (files.length > 0) {
        const uploadPromises = files.map(file => {
          const fd = new FormData();
          fd.append('file', file);
          return api.post('/files/upload', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }).then(res => res.data.data);
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        fileUrls = uploadedUrls.join(',');
      }

      // 2. Get form values
      const data = getValues();

      // 3. Format detailed quotation block
      const quoteText = generateQuoteText(data, quote);

      // 4. Build JSON payload
      const payload = {
        ...data,
        orderType: mapServiceToOrderType(data.serviceType),
        urgency: mapPriorityToUrgency(data.deliveryPriority),
        workType: mapMediumToWorkType(data.outputMedium),
        description: `${quoteText}\n\n=== STUDENT DESCRIPTION ===\n\n${data.description}`,
        materialCost: isNaN(Number(data.materialCost)) ? 0 : Number(data.materialCost),
        pages: isNaN(Number(data.pages)) ? 1 : Number(data.pages),
        locationRadiusKm: isNaN(Number(data.locationRadiusKm)) ? 5.0 : Number(data.locationRadiusKm),
        latitude: userCenter.lat,
        longitude: userCenter.lng,
        fileUrls: fileUrls || null
      };

      const response = await createOrder(payload);
      const newOrder = response?.data?.data || response?.data || response;
      setCreatedOrder(newOrder);
      setIsOrderPreCreating(false);
      return newOrder;
    } catch (err) {
      console.error('Failed to pre-create order:', err);
      toast.error('Could not initiate Stripe checkout. Failed to create order.');
      setIsOrderPreCreating(false);
      setPaymentMethod('wallet');
      return null;
    }
  };

  useEffect(() => {
    if (step === 6 && paymentMethod === 'card') {
      ensureOrderCreated();
    }
  }, [step, paymentMethod]);

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setTimeout(() => {
        if (dontAskAgain) localStorage.setItem('locationPermissionDecision', 'denied');
        setShowLocationModal(false);
        setIsDemoMode(true);
      }, 1500);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsDemoMode(false);
        setShowLocationModal(false);
        localStorage.setItem('locationPermissionDecision', 'granted');
      },
      (error) => {
        setLocationError("Location access denied. Showing demo mode.");
        setTimeout(() => {
          if (dontAskAgain) localStorage.setItem('locationPermissionDecision', 'denied');
          setShowLocationModal(false);
          setIsDemoMode(true);
        }, 1500);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const startDemoMode = () => {
    if (dontAskAgain) localStorage.setItem('locationPermissionDecision', 'skipped');
    setIsDemoMode(true);
    setShowLocationModal(false);
  };

  const resetLocationPermission = () => {
    localStorage.removeItem('locationPermissionDecision');
    setShowLocationModal(true);
    setLocationError(null);
  };


  const { register, handleSubmit, watch, setValue, trigger, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      title: '',
      serviceType: 'Assignment',
      academicLevel: 'UG',
      description: '',
      pages: 1,
      deadline: getTomorrowDateTimeString(),
      deliveryPriority: 'Normal',
      outputMedium: 'Typed',
      diagramsCount: 0,
      diagramComplexity: 'Simple',
      colorDiagrams: false,
      materialCost: 0,
      hardwareComponentsCost: 0,
      modelType: 'None',
      printingType: 'None',
      bindingType: 'None',
      subject: '',
      locationRadiusKm: 5.0,
    }
  });

  const formValues = watch();

  const radius = formValues.locationRadiusKm || 5.0;

  // Poll for all writers globally (radius=1000) so we can list them all
  const { data: allWritersData } = useQuery({
    queryKey: ['allWriters', userCenter.lat, userCenter.lng],
    queryFn: async () => {
      const res = await api.get(`/writermatch/nearby-writers?latitude=${userCenter.lat}&longitude=${userCenter.lng}&radius=1000.0`);
      return res.data.data || [];
    },
    refetchInterval: 5000,
  });

  const writersList = isDemoMode
    ? MOCK_WRITERS.map(w => ({
        ...w,
        initials: w.name.split(' ').map(n=>n[0]).join('').toUpperCase(),
        degree: w.spec.split(', ')[0],
        specializations: w.spec.split(', '),
        isAvailable: w.status === 'available',
        distanceKm: w.dist * radius,
        rating: w.rating,
        bio: `Professional academic expert specializing in ${w.spec}.`
      }))
    : (allWritersData || []);

  const nearbyWriters = isDemoMode
    ? writersList.filter(w => w.isAvailable)
    : writersList.filter(w => w.distanceKm <= radius);

  const quote = calculateQuote(formValues);

  const onDrop = useCallback(accepted => {
    setFiles(f => [...f, ...accepted]);
    toast.success('Resource file attached successfully.');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip']
    } 
  });

  const removeFile = (idx) => {
    setFiles(fl => fl.filter((_, i) => i !== idx));
    toast.error('File attachment removed.');
  };

  const handleNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['title', 'subject', 'serviceType', 'academicLevel', 'locationRadiusKm'];
    } else if (step === 2) {
      fieldsToValidate = ['description', 'pages', 'materialCost', 'diagramsCount', 'diagramComplexity', 'colorDiagrams', 'hardwareComponentsCost', 'modelType', 'printingType', 'bindingType'];
    } else if (step === 4) {
      fieldsToValidate = ['deadline', 'deliveryPriority', 'outputMedium'];
    }

    // Drop files require no explicit form field validations
    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        toast.error('Please resolve validation errors in the current step.');
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const onSubmitForm = async (data) => {
    try {
      if (paymentMethod === 'card') {
        return;
      }

      if (createdOrder) {
        toast.success('Order successfully registered.');
        navigate('/student/orders');
        return;
      }

      // 1. Upload files first if any
      let fileUrls = '';
      if (files.length > 0) {
        const uploadPromises = files.map(file => {
          const fd = new FormData();
          fd.append('file', file);
          return api.post('/files/upload', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }).then(res => res.data.data);
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        fileUrls = uploadedUrls.join(',');
      }

      // 2. Format detailed quotation block
      const quoteText = generateQuoteText(data, quote);

      // 3. Build JSON payload matching OrderRequest DTO structure with mappings
      const payload = {
        ...data,
        orderType: mapServiceToOrderType(data.serviceType),
        urgency: mapPriorityToUrgency(data.deliveryPriority),
        workType: mapMediumToWorkType(data.outputMedium),
        description: `${quoteText}\n\n=== STUDENT DESCRIPTION ===\n\n${data.description}`,
        materialCost: isNaN(Number(data.materialCost)) ? 0 : Number(data.materialCost),
        pages: isNaN(Number(data.pages)) ? 1 : Number(data.pages),
        locationRadiusKm: isNaN(Number(data.locationRadiusKm)) ? 5.0 : Number(data.locationRadiusKm),
        latitude: userCenter.lat,
        longitude: userCenter.lng,
        fileUrls: fileUrls || null
      };

      await createOrder(payload);
      toast.success('Order successfully registered.');
      navigate('/student/orders');
    } catch (err) {
      console.error('Submit form error:', err);
      toast.error('Failed to register order. Limit exceeded or invalid parameter.');
    }
  };


  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-4xl mx-auto pb-10 select-none relative"
    >
      {/* PART 1 — LOCATION PERMISSION POPUP */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fade-in">
          <div className="bg-white text-zinc-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-zinc-100 animate-scale-up">
            <div className="relative inline-block mb-5">
              <span className="text-5xl drop-shadow-md animate-bounce inline-block">📍</span>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#e8a0a0]/20 rounded-full animate-ping z-[-1]" />
            </div>
            <h2 className="text-xl font-bold text-zinc-800 mb-2 font-orbitron">Find Writers Near You</h2>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6">
              Allow location access to discover available writers in your area in real time.
            </p>
            
            <div className="flex flex-col gap-2.5">
              <button 
                type="button"
                onClick={requestLiveLocation}
                className="bg-[#e8a0a0] hover:bg-[#df8a8a] text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-[#e8a0a0]/30 transition-transform active:scale-[0.98] cursor-pointer"
              >
                Enable Location
              </button>
              <button 
                type="button"
                onClick={startDemoMode}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
            </div>

            {/* Don't ask again checkbox */}
            <label className="flex items-center justify-center gap-2 mt-5 cursor-pointer group">
              <input
                type="checkbox"
                id="dont-ask-again"
                checked={dontAskAgain}
                onChange={e => setDontAskAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-zinc-500"
              />
              <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 transition-colors">
                Don&apos;t ask again on this device
              </span>
            </label>

            {locationError && (
              <div className="mt-4 text-[10px] text-red-500 font-semibold leading-relaxed">
                {locationError}
              </div>
            )}
          </div>
        </div>
      )}


      <TopNav title="Create New Order" />

      {/* Stepper Indicator */}
      <div className="grid grid-cols-6 gap-2 mb-8">
        {STEPS.map((s) => (
          <div key={s.num} className="flex flex-col items-center">
            <div className={clsx(
              "w-7 h-7 rounded-full border flex items-center justify-center font-semibold text-xs transition-all duration-300",
              step === s.num ? "bg-[#c5a880] border-[#c5a880] text-black" :
              step > s.num ? "bg-[#70a382]/20 border-[#70a382] text-[#70a382]" :
              "border-white/5 text-muted bg-[#111113]"
            )}>
              {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
            </div>
            <span className={clsx(
              "text-[8px] uppercase tracking-wider mt-1.5 font-medium text-center hidden md:inline-block",
              step === s.num ? "text-[#c5a880]" : "text-muted"
            )}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left container: Wizard Step */}
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Academic Task Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-6 animate-fade-up"
              >
                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <h3 className="text-[10px] text-muted uppercase tracking-widest font-semibold">
                    Step 1: Academic Task Details
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-5">
                    <Input
                      label="Order Title"
                      placeholder="e.g. Analysis of Corporate Finance Ledgers"
                      error={errors.title?.message}
                      {...register('title')}
                    />
                    <Input
                      label="Subject Domain"
                      placeholder="e.g. Corporate Finance, Macroeconomics, AI Algorithms"
                      error={errors.subject?.message}
                      {...register('subject')}
                    />
                  </div>

                  <div className="pt-2">
                    <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium mb-3">
                      Service Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SERVICES.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setValue('serviceType', opt)}
                          className={clsx(
                            "py-2 px-2.5 rounded border text-[9px] font-mono transition-colors uppercase tracking-wider text-left flex justify-between items-center",
                            formValues.serviceType === opt
                              ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                              : 'border-white/5 text-muted hover:border-zinc-700 hover:text-secondary'
                          )}
                        >
                          <span className="truncate">{opt}</span>
                          {formValues.serviceType === opt && <Check className="w-3 h-3 text-[#c5a880] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium mb-3">
                      Academic Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {ACADEMIC_LEVELS.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setValue('academicLevel', opt)}
                          className={clsx(
                            "py-2 px-3 rounded border text-[10px] font-mono transition-colors uppercase tracking-wider text-center flex justify-center items-center",
                            formValues.academicLevel === opt
                              ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                              : 'border-white/5 text-muted hover:border-zinc-700 hover:text-secondary'
                          )}
                        >
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-secondary text-[10px] font-mono uppercase tracking-widest flex justify-between font-medium">
                      <span>Writermatch Search Range</span>
                      <span className="text-[#c5a880] font-semibold font-mono">{formValues.locationRadiusKm} KM</span>
                    </label>
                    <input
                      className="w-full accent-[#c5a880] bg-void/50 rounded-lg cursor-pointer mt-2"
                      type="range"
                      min="1"
                      max="30"
                      step="0.5"
                      value={formValues.locationRadiusKm || 5}
                      onChange={e => setValue('locationRadiusKm', Number(e.target.value))}
                    />
                    <div className="flex justify-between text-[8px] font-mono text-muted mt-1 select-none uppercase tracking-wider">
                      <span>1 KM</span>
                      <span>15 KM</span>
                      <span>30 KM</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex flex-col items-center">
                    <h4 className="text-[10px] text-muted uppercase tracking-widest font-semibold font-orbitron mb-4 text-center">
                      Live Nearby Available Writers Radar
                    </h4>
                    <div className="flex justify-center">
                      <RadarScannerMap
                        writers={isDemoMode ? writersList : nearbyWriters}
                        radius={radius}
                        center={userCenter}
                        onSelectWriter={setSelectedWriter}
                        isDemoMode={isDemoMode}
                      />
                    </div>
                    <div className="flex justify-between w-full text-[10px] font-mono mt-4 pt-3 border-t border-white/[0.02] items-center">
                      <span className="text-secondary">Writers in radius</span>
                      <span className="text-[#c5a880] font-bold">{nearbyWriters.length} found</span>
                    </div>

                    {/* Location status indicator + reset */}
                    <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-white/[0.02]">
                      <div className={clsx(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono uppercase tracking-wider',
                        isDemoMode
                          ? 'bg-[#ffb703]/10 border-[#ffb703]/30 text-[#ffb703]'
                          : 'bg-[#06ffa5]/10 border-[#06ffa5]/30 text-[#06ffa5]'
                      )}>
                        <span>{isDemoMode ? '🟡' : '📍'}</span>
                        <span>{isDemoMode ? 'Demo Mode' : 'Live GPS'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={resetLocationPermission}
                        className="text-[9px] font-mono text-muted hover:text-secondary underline underline-offset-2 transition-colors"
                      >
                        Reset Location
                      </button>
                    </div>

                    <div className="w-full mt-5 space-y-2 border-t border-white/5 pt-4">
                      <h4 className="text-[10px] text-muted uppercase tracking-widest font-semibold font-orbitron text-left mb-3">
                        Active Writer Network
                      </h4>
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar w-full text-left">
                        {writersList.map(w => {
                          const isInRange = isDemoMode ? w.isAvailable : w.distanceKm <= radius;
                          const isSelected = selectedWriter?.id === w.id;
                          return (
                            <div
                              key={w.id}
                              onClick={() => setSelectedWriter(w)}
                              className={clsx(
                                "p-3 rounded border transition-all cursor-pointer flex items-center justify-between",
                                isSelected 
                                  ? "bg-[#c5a880]/15 border-[#c5a880]/50 shadow-[0_0_8px_rgba(197,168,128,0.15)]" 
                                  : "bg-void/40 border-white/5 hover:border-zinc-800"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={clsx(
                                  "w-7 h-7 rounded flex items-center justify-center font-mono text-[10px] font-bold shrink-0",
                                  w.isAvailable 
                                    ? "bg-[#06ffa5]/10 border border-[#06ffa5]/30 text-[#06ffa5]" 
                                    : "bg-[#ffb703]/10 border border-[#ffb703]/30 text-[#ffb703]"
                                )}>
                                  {w.initials}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-primary">{w.name}</span>
                                    <span className="text-[9px] font-mono text-muted">{w.degree}</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-muted block mt-0.5 max-w-[160px] truncate">
                                    {w.specializations?.join(', ')}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1 shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={clsx(
                                    "w-1.5 h-1.5 rounded-full block",
                                    w.isAvailable ? "bg-[#06ffa5] shadow-[0_0_4px_#06ffa5]" : "bg-[#ffb703] shadow-[0_0_4px_#ffb703]"
                                  )} />
                                  <span className="text-[9px] font-mono text-muted uppercase tracking-wider">
                                    {w.isAvailable ? 'Available' : 'Busy'}
                                  </span>
                                </div>
                                <span className={clsx(
                                  "text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border",
                                  isInRange 
                                    ? "text-[#70a382] bg-[#70a382]/10 border-[#70a382]/20" 
                                    : "text-zinc-500 bg-zinc-800/20 border-white/5"
                                )}>
                                  {isInRange ? `${w.distanceKm?.toFixed(1)} km` : `${w.distanceKm?.toFixed(1)} km`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedWriter && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="bg-void/50 border border-[#c5a880]/30 rounded-md p-4 mt-4 w-full text-left"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[8px] font-mono text-muted uppercase tracking-widest font-bold">Writer Profile</span>
                            <button 
                              type="button" 
                              onClick={() => setSelectedWriter(null)} 
                              className="text-muted hover:text-white font-mono text-[8px] uppercase tracking-wider"
                            >
                              ✕ Close
                            </button>
                          </div>
                          <div className="space-y-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center font-mono text-xs text-[#c5a880] font-bold">
                                {selectedWriter.initials || selectedWriter.name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <h5 className="font-orbitron font-semibold text-xs text-primary">{selectedWriter.name}</h5>
                                <p className="text-[9px] font-mono text-muted mt-0.5">
                                  {selectedWriter.degree || 'Expert Writer'} • {selectedWriter.distanceKm?.toFixed(1)} km
                                </p>
                              </div>
                              <div className="ml-auto text-right">
                                <span className="text-[#c5a880] font-bold text-xs block">{selectedWriter.rating || 5.0} ★</span>
                              </div>
                            </div>
                            <p className="text-muted text-[10px] leading-relaxed italic bg-void/35 p-3 rounded border border-white/5 font-dm">
                              "{selectedWriter.bio || 'Available for matching and research delivery.'}"
                            </p>
                            {selectedWriter.specializations && selectedWriter.specializations.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {selectedWriter.specializations.map(spec => (
                                  <span key={spec} className="px-2 py-0.5 bg-[#c5a880]/10 border border-[#c5a880]/20 text-[#c5a880] text-[8px] font-mono rounded uppercase tracking-wider">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STEP 2: Requirements & Instructions */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-6 animate-fade-up"
              >
                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <h3 className="text-[10px] text-muted uppercase tracking-widest font-semibold">
                    Step 2: Requirements & Instructions
                  </h3>
                  
                  <TextArea
                    label="Detailed Instructions"
                    placeholder="Provide detailed project specifications, references, styling protocols, structures, and grading rubrics..."
                    error={errors.description?.message}
                    rows={6}
                    {...register('description')}
                  />
                </Card>

                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <h4 className="text-[9px] text-muted uppercase tracking-widest font-semibold font-orbitron mb-2">
                    Sizing & Material Costs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Expected Pages count"
                      type="number"
                      min="1"
                      max="500"
                      error={errors.pages?.message}
                      {...register('pages', { valueAsNumber: true })}
                    />
                    <Input
                      label="Material Cost Allocation (₹)"
                      type="number"
                      min="0"
                      helperText="Allocation budget for additional physical lab manuals, reference notes, project components etc."
                      error={errors.materialCost?.message}
                      {...register('materialCost', { valueAsNumber: true })}
                    />
                  </div>
                </Card>

                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <h4 className="text-[9px] text-muted uppercase tracking-widest font-semibold font-orbitron mb-2">
                    Diagram Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Number of Diagrams"
                      type="number"
                      min="0"
                      error={errors.diagramsCount?.message}
                      {...register('diagramsCount', { valueAsNumber: true })}
                    />
                    {formValues.diagramsCount > 0 && (
                      <div className="flex flex-col gap-1.5 justify-end pb-1.5">
                        <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium">
                          Color Diagrams
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setValue('colorDiagrams', true)}
                            className={clsx(
                              "py-1.5 px-4 rounded border text-[10px] font-mono transition-colors uppercase tracking-wider text-center flex-1",
                              formValues.colorDiagrams
                                ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                                : 'border-white/5 text-muted hover:border-zinc-700'
                            )}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setValue('colorDiagrams', false)}
                            className={clsx(
                              "py-1.5 px-4 rounded border text-[10px] font-mono transition-colors uppercase tracking-wider text-center flex-1",
                              !formValues.colorDiagrams
                                ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                                : 'border-white/5 text-muted hover:border-zinc-700'
                            )}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {formValues.diagramsCount > 0 && (
                    <div className="pt-2 border-t border-white/5">
                      <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium mb-3">
                        Diagram Complexity
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {DIAGRAM_COMPLEXITIES.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setValue('diagramComplexity', opt)}
                            className={clsx(
                              "py-2 px-3 rounded border text-[10px] font-mono transition-colors uppercase tracking-wider text-center",
                              formValues.diagramComplexity === opt
                                ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                                : 'border-white/5 text-muted hover:border-zinc-700'
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {((formValues.serviceType === 'Model') || ['Model', 'Mini Project', 'Final Year Project', 'Hardware Project', 'IoT Project', 'AI/ML Project'].includes(formValues.serviceType)) && (
                  <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                    <h4 className="text-[9px] text-muted uppercase tracking-widest font-semibold font-orbitron mb-2">
                      Project & Model Specifications
                    </h4>
                    
                    {formValues.serviceType === 'Model' && (
                      <div className="space-y-2">
                        <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium mb-2">
                          Model Type
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {MODEL_TYPES.filter(m => m !== 'None').map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setValue('modelType', opt)}
                              className={clsx(
                                "py-2 px-1 rounded border text-[8px] font-mono transition-colors uppercase tracking-wider text-center flex items-center justify-center min-h-[40px] leading-tight",
                                formValues.modelType === opt
                                  ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                                  : 'border-white/5 text-muted hover:border-zinc-700'
                              )}
                            >
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {['Model', 'Mini Project', 'Final Year Project', 'Hardware Project', 'IoT Project', 'AI/ML Project'].includes(formValues.serviceType) && (
                      <div className="pt-2 border-t border-white/5">
                        <Input
                          label="Hardware Components Cost (₹)"
                          type="number"
                          min="0"
                          helperText="Markup multiplier of 1.30 will be applied automatically to hardware components."
                          error={errors.hardwareComponentsCost?.message}
                          {...register('hardwareComponentsCost', { valueAsNumber: true })}
                        />
                      </div>
                    )}
                  </Card>
                )}

                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <h4 className="text-[9px] text-muted uppercase tracking-widest font-semibold font-orbitron mb-2">
                    Printing & Binding Preferences
                  </h4>
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium mb-3">
                        Printing Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {PRINTING_TYPES.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setValue('printingType', opt)}
                            className={clsx(
                              "py-2 px-3 rounded border text-[10px] font-mono transition-colors uppercase tracking-wider text-center",
                              formValues.printingType === opt
                                ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                                : 'border-white/5 text-muted hover:border-zinc-700'
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium mb-3">
                        Binding Option
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {BINDING_TYPES.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setValue('bindingType', opt)}
                            className={clsx(
                              "py-2 px-3 rounded border text-[10px] font-mono transition-colors uppercase tracking-wider text-center",
                              formValues.bindingType === opt
                                ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                                : 'border-white/5 text-muted hover:border-zinc-700'
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STEP 3: Upload Files */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-6 animate-fade-up"
              >
                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <h3 className="text-[10px] text-muted uppercase tracking-widest font-semibold">
                    Step 3: Upload Reference Materials
                  </h3>
                  
                  <div
                    {...getRootProps()}
                    className={clsx(
                      "border border-dashed rounded p-8 text-center transition-colors cursor-pointer",
                      isDragActive 
                        ? 'border-[#c5a880] bg-[#c5a880]/5' 
                        : 'border-white/5 hover:border-zinc-700 hover:bg-[#111113]/50'
                    )}
                  >
                    <input {...getInputProps()} />
                    <UploadCloud className="w-8 h-8 text-[#c5a880] mx-auto mb-3" />
                    <p className="text-secondary text-xs font-semibold">Drag & drop files here or click to browse</p>
                    <p className="text-muted text-[9px] font-mono mt-1 uppercase tracking-wider">PDF, DOC, DOCX, TXT, PNG, JPG, JPEG, ZIP (Max 10MB)</p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                      <span className="text-[9px] text-muted uppercase tracking-wider font-mono block">Attached Documents ({files.length})</span>
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded bg-white/[0.01] border border-white/5">
                          <div className="flex items-center gap-2 truncate max-w-[80%]">
                            <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span className="text-secondary text-xs font-mono truncate">{f.name}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeFile(i)} 
                            className="text-[#cb6e6e] hover:bg-[#cb6e6e]/10 p-1.5 rounded transition-colors"
                            aria-label="Remove resource file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* STEP 4: Deadline & Priority */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-6 animate-fade-up"
              >
                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <h3 className="text-[10px] text-muted uppercase tracking-widest font-semibold">
                    Step 4: Deadline & Urgency
                  </h3>
                  
                  <Input
                    label="Deadline Date & Time"
                    type="datetime-local"
                    error={errors.deadline?.message}
                    {...register('deadline')}
                  />
                </Card>

                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium">
                    Delivery Priority
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PRIORITIES.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setValue('deliveryPriority', opt)}
                        className={clsx(
                          "py-2 px-1 rounded border text-[9px] font-mono transition-colors uppercase tracking-wider text-center flex items-center justify-center min-h-[40px] leading-tight",
                          formValues.deliveryPriority === opt
                            ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                            : 'border-white/5 text-muted hover:border-zinc-700'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <label className="text-secondary text-[10px] font-mono uppercase tracking-widest block font-medium">
                    Output Medium
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {OUTPUT_MEDIUMS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setValue('outputMedium', opt)}
                        className={clsx(
                          "py-2.5 px-2 rounded border text-[10px] font-mono transition-colors uppercase tracking-wider text-center flex items-center justify-center min-h-[40px] leading-tight",
                          formValues.outputMedium === opt
                            ? 'bg-[#c5a880]/15 border-[#c5a880]/40 text-[#c5a880] font-semibold'
                            : 'border-white/5 text-muted hover:border-zinc-700'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </Card>


              </motion.div>
            )}

            {/* STEP 5: Pricing Review */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-6 animate-fade-up"
              >
                <Card className="p-6 bg-[#111113] border-white/5 space-y-4">
                  <h3 className="text-[10px] text-muted uppercase tracking-widest font-semibold">
                    Step 5: Pricing Review Summary
                  </h3>

                  <div className="pt-2">
                    <pre className="bg-[#09090b]/80 p-5 rounded border border-white/5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap overflow-x-auto text-[#c5a880] select-all">
                      {generateQuoteText(formValues, quote)}
                    </pre>
                  </div>

                  <div className="text-xs pt-4 border-t border-white/5">
                    <span className="text-muted block uppercase font-mono text-[9px] mb-1.5">Project Guidelines</span>
                    <p className="text-secondary leading-relaxed bg-[#09090b]/50 p-4 rounded border border-white/5 font-mono whitespace-pre-line text-[11px]">
                      {formValues.description || 'No detailed instructions provided.'}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STEP 6: Payment Confirmation */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-6 animate-fade-up"
              >
                <Card className="p-6 bg-[#111113] border-white/5 space-y-5">
                  {paymentState === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                      <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#70a382]/10 border border-[#70a382]/30 rounded-full flex items-center justify-center animate-pulse">
                          <span className="text-3xl text-[#70a382] font-bold">✓</span>
                        </div>
                      </div>
                      <h3 className="font-orbitron font-bold text-lg text-[#70a382] tracking-wider uppercase">
                        ORDER PLACED & PAID
                      </h3>
                      <div className="font-mono text-xs text-secondary space-y-1">
                        <p>ORDER ID: <span className="text-primary font-semibold">#{createdOrder?.id}</span></p>
                        <p>PAID: <span className="text-[#c5a880] font-semibold">INR {formatINR(quote.grandTotal)}</span></p>
                      </div>
                      <p className="text-[11px] font-mono text-secondary animate-pulse pt-2">
                        Redirecting to your orders panel...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center pb-2">
                        <div className="w-12 h-12 bg-[#70a382]/10 border border-[#70a382]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CreditCard className="w-6 h-6 text-[#70a382]" />
                        </div>
                        <h3 className="font-orbitron font-semibold text-sm text-primary uppercase tracking-wider">
                          Authorise Order Payment
                        </h3>
                        <p className="text-secondary text-xs mt-1.5 max-w-sm mx-auto font-dm">
                          Total: <span className="text-[#c5a880] font-semibold">&#8377;{formatINR(quote.grandTotal)}</span>. Choose how to pay.
                        </p>
                      </div>

                      {/* Payment method toggle */}
                      <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/5">
                        <button
                          type="button"
                          id="pay-wallet-tab"
                          onClick={() => setPaymentMethod('wallet')}
                          className={clsx(
                            'flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 uppercase tracking-wider font-orbitron',
                            paymentMethod === 'wallet'
                              ? 'bg-[#1e3a2b] text-[#70a382] border border-[#70a382]/30'
                              : 'text-secondary hover:text-primary'
                          )}
                        >
                          Wallet
                        </button>
                        <button
                          type="button"
                          id="pay-card-tab"
                          onClick={() => { setPaymentMethod('card'); setStripeError(null); }}
                          className={clsx(
                            'flex-1 py-2 text-xs font-semibold rounded-md transition-all duration-200 uppercase tracking-wider font-orbitron',
                            paymentMethod === 'card'
                              ? 'bg-[#1e2a3a] text-[#6e96cb] border border-[#6e96cb]/30'
                              : 'text-secondary hover:text-primary'
                          )}
                        >
                          Pay with Card
                        </button>
                      </div>

                      {/* Wallet payment detail */}
                      {paymentMethod === 'wallet' && (
                        <div className="bg-[#09090b]/50 p-4 rounded border border-white/5 space-y-3.5 text-xs font-mono select-none">
                          <div className="flex justify-between items-center text-secondary">
                            <span>WALLET BALANCE</span>
                            <span>&#8377;{(14280.00).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center text-[#cb6e6e] border-b border-white/5 pb-2.5">
                            <span>ORDER COST</span>
                            <span>- &#8377;{formatINR(quote.grandTotal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-[#70a382] font-semibold">
                            <span>REMAINING FUNDS</span>
                            <span>&#8377;{formatINR(14280.00 - quote.grandTotal)}</span>
                          </div>
                        </div>
                      )}

                      {/* Stripe card payment */}
                      {paymentMethod === 'card' && (
                        <div className="space-y-3">
                          {isOrderPreCreating ? (
                            <div className="flex flex-col items-center justify-center py-6 space-y-2">
                              <div className="w-6 h-6 border-2 border-t-transparent border-[#6e96cb] rounded-full animate-spin" />
                              <p className="text-secondary text-xs font-mono">Creating order...</p>
                            </div>
                          ) : createdOrder ? (
                            <PaymentGateway
                              amount={quote.grandTotal}
                              onSuccess={handlePaymentSuccess}
                              onError={handlePaymentError}
                              orderId={createdOrder.id}
                              studentId={user?.id}
                            />
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-[#cb6e6e] text-xs font-mono">Failed to initiate card checkout.</p>
                              <Button
                                type="button"
                                variant="secondary"
                                size="xs"
                                onClick={ensureOrderCreated}
                                className="mt-2 text-[10px]"
                              >
                                Retry
                              </Button>
                            </div>
                          )}
                          <p className="text-secondary text-[10px] font-mono text-center pt-2 border-t border-white/5">
                            Secured by Stripe. Your card details are never stored on our servers.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </motion.div>
            )}


            {/* Stepper Actions Row */}
            {paymentState !== 'success' && (
              <div className="flex justify-between items-center pt-2">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> <span>Back</span>
                  </Button>
                ) : (
                  <div />
                )}

                {step < 6 ? (
                  <Button
                    type="button"
                    variant="plasma"
                    size="sm"
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5"
                  >
                    <span>Continue</span> <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  paymentMethod !== 'card' && (
                    <Button
                      variant="primary"
                      type="submit"
                      size="sm"
                      disabled={isPending}
                      className="flex items-center gap-1.5 font-bold"
                    >
                      <span>{isPending ? 'Processing...' : 'Confirm Order & Pay'}</span>
                    </Button>
                  )
                )}
              </div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Sidebar pricing estimate */}
        <div className="space-y-6">
          <Card className="p-6 bg-[#111113] border-white/5 sticky top-8">
            <h3 className="font-orbitron font-semibold text-secondary text-[9px] uppercase tracking-widest mb-6 text-center border-b border-white/5 pb-2">
              Payment Summary
            </h3>
            
            <div className="space-y-4">
              {(() => {
                const sidebarLines = [];
                if (quote.basePrice > 0) {
                  sidebarLines.push({ label: 'Base Service Cost', value: quote.basePrice });
                }
                if (quote.pageWritingCost > 0) {
                  sidebarLines.push({ 
                    label: `Page Writing Cost (${formValues.pages} pages)`, 
                    value: quote.pageWritingCost 
                  });
                }
                if (quote.diagramCost > 0) {
                  sidebarLines.push({ 
                    label: `Diagram Cost (${formValues.diagramsCount} diagrams)`, 
                    value: quote.diagramCost 
                  });
                }
                if (Number(formValues.materialCost) > 0) {
                  sidebarLines.push({ 
                    label: 'Material Cost', 
                    value: Number(formValues.materialCost) 
                  });
                }
                if (quote.hardwareCost > 0) {
                  sidebarLines.push({ 
                    label: 'Hardware Cost (×1.30)', 
                    value: quote.hardwareCost 
                  });
                }
                if (quote.printingCost > 0) {
                  sidebarLines.push({ 
                    label: 'Printing Cost', 
                    value: quote.printingCost 
                  });
                }
                if (quote.bindingCost > 0) {
                  sidebarLines.push({ 
                    label: 'Binding Cost', 
                    value: quote.bindingCost 
                  });
                }
                if (quote.prioritySurcharge > 0) {
                  sidebarLines.push({ 
                    label: `Priority Surcharge (+${Math.round(quote.priorityPercent * 100)}%)`, 
                    value: quote.prioritySurcharge 
                  });
                }

                return sidebarLines.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs border-b border-white/[0.02] pb-3">
                    <span className="text-secondary font-mono uppercase text-[9px] tracking-wider">{label}</span>
                    <span className="text-primary font-mono font-semibold">₹{formatINR(value)}</span>
                  </div>
                ));
              })()}
              
              <div className="pt-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#c5a880] text-xs font-semibold uppercase tracking-wider font-orbitron">Total Cost</span>
                  <span className="text-primary font-mono font-bold text-xl">
                    ₹{formatINR(quote.grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </form>
    </motion.div>
  );
}